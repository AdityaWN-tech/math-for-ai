import type { PyodideInterface } from "pyodide";

let pyodidePromise: Promise<PyodideInterface> | null = null;

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

  const { loadPyodide } = await import("pyodide");
  return loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
  });
}

export function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodideInstance();
  }
  return pyodidePromise;
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
