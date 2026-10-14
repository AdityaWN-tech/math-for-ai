import type { PyodideInterface } from "pyodide";

let pyodidePromise: Promise<PyodideInterface> | null = null;
let pyodideReady = false;

export interface TestResult {
  name: string;
  pass: boolean;
  msg: string;
}

export interface RunResult {
  stdout: string;
  tests: TestResult[];
  allPassed: boolean;
  error?: string;
}

async function loadPyodideInstance(): Promise<PyodideInterface> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only run in the browser");
  }

  // Load the CDN build directly: bundling the `pyodide` npm package breaks under
  // Turbopack ("Cannot find module as expression is too dynamic").
  const w = window as unknown as { loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface> };
  if (!w.loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Python runtime. Check your connection."));
      document.head.appendChild(script);
    });
  }
  return w.loadPyodide!({ indexURL: PYODIDE_INDEX_URL });
}

const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

export function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodideInstance().then((p) => {
      pyodideReady = true;
      return p;
    });
  }
  return pyodidePromise;
}

/**
 * Like runPythonWithTests, but runs in a fresh namespace and converts the result
 * to plain JS so dict keys are readable.
 */
export async function runPythonChecks(userCode: string, harness: string): Promise<RunResult> {
  try {
    const pyodide = await getPyodide();
    const ns = pyodide.globals.get("dict")();
    const script = `
import sys
from io import StringIO
_buf = StringIO()
_old = sys.stdout
sys.stdout = _buf
__results = []
try:
    exec(compile(_user_code, "main.py", "exec"), globals())
    exec(compile(_harness, "harness.py", "exec"), globals())
finally:
    sys.stdout = _old
{"stdout": _buf.getvalue(), "tests": __results}
`;
    ns.set("_user_code", userCode);
    ns.set("_harness", harness);
    const proxy = await pyodide.runPythonAsync(script, { globals: ns });
    const out = proxy.toJs({ dict_converter: Object.fromEntries }) as {
      stdout: string;
      tests: TestResult[];
    };
    proxy.destroy();
    ns.destroy();
    return {
      stdout: out.stdout,
      tests: out.tests,
      allPassed: out.tests.length > 0 && out.tests.every((t) => t.pass),
    };
  } catch (error) {
    // a failed load must not poison every later run
    if (!pyodideReady) pyodidePromise = null;
    const message = error instanceof Error ? error.message : String(error);
    return { stdout: "", tests: [], allPassed: false, error: message.split("\n").slice(-4).join("\n") };
  }
}

export async function runPythonWithTests(
  userCode: string,
  testHarness: string,
): Promise<RunResult> {
  try {
    const pyodide = await getPyodide();

    const capture = `
import sys
from io import StringIO
_buf = StringIO()
_old = sys.stdout
sys.stdout = _buf
`;

    const script = `
${capture}
__results = []
${userCode}

${testHarness}
_out = _buf.getvalue()
sys.stdout = _old
{"stdout": _out, "tests": __results, "allPassed": all(t["pass"] for t in __results)}
`;

    const result = await pyodide.runPythonAsync(script);
    return {
      stdout: String(result.stdout ?? ""),
      tests: (result.tests ?? []) as TestResult[],
      allPassed: Boolean(result.allPassed),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      stdout: "",
      tests: [],
      allPassed: false,
      error: message,
    };
  }
}
