#!/usr/bin/env node
/**
 * Scaffold interactive lesson JSON from compiled previews + exercise specs.
 * Usage: node scripts/build-interactive-lessons.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const COMPILED = path.join(ROOT, "apps/web/src/content/lessons/compiled");
const OUT = path.join(ROOT, "apps/web/src/content/lessons/interactive");
const MANIFEST = path.join(ROOT, "apps/web/src/content/lessons/interactive-manifest.json");

/** @type {Array<{id:string,phaseId:number,lessonNumber:number,title:string,concept?:string,figure?:string,build:{filename:string,starter:string,tests:string},artifact:{name:string,description:string}}>} */
const SPECS = [
  // Phase 0 remainder
  {
    id: "08-editor-setup",
    phaseId: 0,
    lessonNumber: 8,
    title: "Editor Setup",
    concept: "Your editor is mission control: LSP for types, integrated terminal for runs, debugger for breakpoints. Cursor/VS Code + Python/TS extensions match the rest of this course.",
    build: {
      filename: "editor.py",
      starter: "def shortcut_action(keys):\n    \"\"\"Map common shortcuts to actions (lowercase keys string).\"\"\"\n    # TODO: 'cmd+enter' -> 'run', 'cmd+p' -> 'quick_open', else 'unknown'\n    return \"unknown\"\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("run", shortcut_action("cmd+enter") == "run")\n    __check("open", shortcut_action("cmd+p") == "quick_open")\n    __check("unk", shortcut_action("cmd+z") == "unknown")\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Editor workflow", description: "You can run code, jump to files, and debug without leaving the shell — the platform mirrors this in-lesson." },
  },
  {
    id: "09-data-management",
    phaseId: 0,
    lessonNumber: 9,
    title: "Data Management",
    concept: "AI projects drown in datasets, checkpoints, and logs. Version data like code: splits, hashes, and clear train/val/test boundaries before training.",
    build: {
      filename: "data_splits.py",
      starter: "def split_counts(n, train=0.8, val=0.1):\n    \"\"\"Return (train_n, val_n, test_n) ints summing to n.\"\"\"\n    # TODO\n    return (0, 0, 0)\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    t,v,te = split_counts(100)\n    __check("sum", t+v+te == 100)\n    __check("train", t == 80)\n    __check("val", v == 10)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Split discipline", description: "You can size train/val/test splits and avoid leakage before any model lesson." },
  },
  {
    id: "10-terminal-and-shell",
    phaseId: 0,
    lessonNumber: 10,
    title: "Terminal & Shell",
    concept: "The shell is how you orchestrate training jobs, tail logs, and SSH into GPUs. Pipes chain commands; env vars configure runs.",
    build: {
      filename: "shell.py",
      starter: "def parse_export(line):\n    \"\"\"Parse 'export KEY=value' -> (key, value) or None.\"\"\"\n    # TODO\n    return None\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("ok", parse_export("export CUDA_VISIBLE_DEVICES=0") == ("CUDA_VISIBLE_DEVICES", "0"))\n    __check("bad", parse_export("echo hi") is None)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Shell fluency", description: "You can set env vars and read export lines — prerequisite for cloud GPU and API lessons." },
  },
  {
    id: "11-linux-for-ai",
    phaseId: 0,
    lessonNumber: 11,
    title: "Linux for AI",
    concept: "Cloud GPUs and Docker containers run Linux. Know paths, permissions, and process lists before you SSH into a training box.",
    build: {
      filename: "paths.py",
      starter: "def basename(path):\n    \"\"\"Return final path segment (like os.path.basename).\"\"\"\n    # TODO\n    return \"\"\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("file", basename("/data/models/ckpt.pt") == "ckpt.pt")\n    __check("root", basename("/") == "")\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Path literacy", description: "You can navigate POSIX paths on remote Linux hosts where most training runs." },
  },
  {
    id: "12-debugging-and-profiling",
    phaseId: 0,
    lessonNumber: 12,
    title: "Debugging & Profiling",
    concept: "When loss NaNs or GPU sits idle, you profile. Estimate memory from parameter count before you launch a 70B run.",
    build: {
      filename: "profile.py",
      starter: "def memory_gb(num_params, bytes_per_param=2):\n    \"\"\"Estimate GB for num_params at given bytes/param (fp16=2).\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("7b", abs(memory_gb(7_000_000_000) - 14.0) < 0.1)\n    __check("fp32", abs(memory_gb(1_000_000_000, 4) - 4.0) < 0.1)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "VRAM estimator", description: "You can ballpark GPU memory from parameter count — avoids OOM surprises." },
  },
  // Phase 1 remainder (04–10)
  {
    id: "04-calculus-for-ml",
    phaseId: 1,
    lessonNumber: 4,
    title: "Calculus for ML",
    concept: "The derivative of loss w.r.t. each weight tells you which way to nudge it. Neural nets are gradient-following machines.",
    build: {
      filename: "calculus.py",
      starter: "def numerical_derivative(f, x, h=1e-5):\n    \"\"\"Central difference approximation of f'(x).\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    d = numerical_derivative(lambda x: x*x, 3.0)\n    __check("quad", abs(d - 6.0) < 1e-3)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Gradient intuition", description: "You can approximate derivatives numerically — the same idea behind autograd." },
  },
  {
    id: "05-chain-rule-and-autodiff",
    phaseId: 1,
    lessonNumber: 5,
    title: "Chain Rule & Autodiff",
    concept: "Composed functions multiply local gradients. Backprop is the chain rule applied layer by layer from loss to inputs.",
    build: {
      filename: "chain_rule.py",
      starter: "def chain_rule(dy_du, du_dx):\n    \"\"\"Scalar chain rule: dy/dx = (dy/du)*(du/dx).\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("basic", chain_rule(3.0, 2.0) == 6.0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Backprop building block", description: "You can combine local gradients — one step of reverse-mode autodiff by hand." },
  },
  {
    id: "06-probability-and-distributions",
    phaseId: 1,
    lessonNumber: 6,
    title: "Probability & Distributions",
    concept: "Softmax turns logits into a probability distribution. Cross-entropy loss measures how wrong those probabilities are.",
    build: {
      filename: "softmax.py",
      starter: "import math\n\ndef softmax(logits):\n    \"\"\"Return probability vector summing to 1.\"\"\"\n    # TODO: stable softmax\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    p = softmax([1.0, 2.0, 3.0])\n    __check("sum", abs(sum(p) - 1.0) < 1e-5)\n    __check("order", p[2] > p[1] > p[0])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Softmax from scratch", description: "You can convert logits to probabilities — used in every classifier head." },
  },
  {
    id: "07-bayes-theorem",
    phaseId: 1,
    lessonNumber: 7,
    title: "Bayes' Theorem",
    concept: "Posterior ∝ likelihood × prior. Bayesian updating is how spam filters and medical tests reason under uncertainty.",
    build: {
      filename: "bayes.py",
      starter: "def bayes_posterior(prior, likelihood, evidence):\n    \"\"\"P(H|D) = P(D|H)*P(H)/P(D). All scalars in [0,1].\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    p = bayes_posterior(0.01, 0.9, 0.1)\n    __check("range", 0 <= p <= 1)\n    __check("calc", abs(p - 0.09) < 1e-6)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Bayesian update", description: "You can compute posteriors — foundation for Naive Bayes and probabilistic ML." },
  },
  {
    id: "08-optimization",
    phaseId: 1,
    lessonNumber: 8,
    title: "Optimization",
    concept: "Gradient descent: x_new = x - lr * grad. Learning rate controls step size; too large diverges, too small crawls.",
    build: {
      filename: "optim.py",
      starter: "def gradient_descent_step(x, grad, lr):\n    \"\"\"One GD step on scalar x.\"\"\"\n    # TODO\n    return x\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("step", gradient_descent_step(5.0, 2.0, 0.1) == 4.8)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "GD step", description: "You can apply one gradient descent update — the inner loop of every trainer." },
  },
  {
    id: "09-information-theory",
    phaseId: 1,
    lessonNumber: 9,
    title: "Information Theory",
    concept: "Cross-entropy H(p,q) = -Σ p log q. Language models minimize cross-entropy between predicted and true token distributions.",
    build: {
      filename: "entropy.py",
      starter: "import math\n\ndef cross_entropy(p, q):\n    \"\"\"Cross-entropy for discrete distributions p (true), q (pred).\"\"\"\n    # TODO: assume same length, sum -p_i log q_i\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    ce = cross_entropy([1.0, 0.0], [0.9, 0.1])\n    __check("pos", ce > 0)\n    __check("match", abs(cross_entropy([0.5,0.5],[0.5,0.5]) - math.log(2)) < 1e-5)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Cross-entropy", description: "You can compute CE — the loss behind classification and LLM training." },
  },
  {
    id: "10-dimensionality-reduction",
    phaseId: 1,
    lessonNumber: 10,
    title: "Dimensionality Reduction",
    concept: "PCA finds directions of maximum variance. Project high-dimensional embeddings down for visualization and denoising.",
    build: {
      filename: "pca.py",
      starter: "def center_columns(X):\n    \"\"\"X is list of rows. Return rows with each column mean subtracted.\"\"\"\n    # TODO\n    return X\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    X = [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]\n    C = center_columns(X)\n    col0 = sum(r[0] for r in C)/3\n    __check("c0", abs(col0) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Centering step", description: "You can center data — the required first step before PCA or covariance." },
  },
  // Phase 2 ML (01–05)
  {
    id: "01-what-is-machine-learning",
    phaseId: 2,
    lessonNumber: 1,
    title: "What is Machine Learning",
    concept: "Supervised learning: learn f(x)→y from labeled examples. Split data before you touch the model.",
    build: {
      filename: "ml_basics.py",
      starter: "def train_test_split(n, train_ratio=0.8):\n    \"\"\"Return (train_size, test_size) ints summing to n.\"\"\"\n    # TODO\n    return (0, 0)\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    tr, te = train_test_split(100)\n    __check("sum", tr+te == 100)\n    __check("ratio", tr == 80)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "ML framing", description: "You can split datasets and explain learning-from-data vs hand-written rules." },
  },
  {
    id: "02-linear-regression",
    phaseId: 2,
    lessonNumber: 2,
    title: "Linear Regression",
    concept: "Fit ŷ = wx + b by minimizing mean squared error. The simplest model — and the foundation of neural nets.",
    build: {
      filename: "regression.py",
      starter: "def mse_loss(y_true, y_pred):\n    \"\"\"Mean squared error for equal-length lists.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("zero", mse_loss([1,2],[1,2]) == 0)\n    __check("one", mse_loss([0],[1]) == 1.0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "MSE loss", description: "You can compute regression loss — starting point for all gradient-based fitting." },
  },
  {
    id: "03-logistic-regression",
    phaseId: 2,
    lessonNumber: 3,
    title: "Logistic Regression",
    concept: "Sigmoid squashes logits to (0,1) for binary classification. Decision boundary is linear in feature space.",
    build: {
      filename: "logistic.py",
      starter: "import math\n\ndef sigmoid(z):\n    \"\"\"Standard sigmoid.\"\"\"\n    # TODO\n    return 0.5\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("zero", abs(sigmoid(0) - 0.5) < 1e-9)\n    __check("pos", sigmoid(10) > 0.99)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Sigmoid", description: "You can map logits to probabilities — bridge to neural classification heads." },
  },
  {
    id: "04-decision-trees",
    phaseId: 2,
    lessonNumber: 4,
    title: "Decision Trees",
    concept: "Trees split features to minimize impurity (Gini or entropy). Interpretable before ensembles take over.",
    build: {
      filename: "trees.py",
      starter: "def gini_impurity(counts):\n    \"\"\"counts: class counts [n0, n1, ...]. Return Gini impurity.\"\"\"\n    # TODO\n    return 1.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("pure", gini_impurity([10,0]) == 0)\n    __check("mixed", abs(gini_impurity([5,5]) - 0.5) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Gini impurity", description: "You can score tree splits — how random forests choose branches." },
  },
  {
    id: "05-support-vector-machines",
    phaseId: 2,
    lessonNumber: 5,
    title: "Support Vector Machines",
    concept: "SVMs maximize the margin between classes. Support vectors are the points that define the boundary.",
    build: {
      filename: "svm.py",
      starter: "def margin_width(w_norm, C=1.0):\n    \"\"\"Margin ≈ 2/||w|| for hard-margin intuition.\"\"\"\n    # TODO: w_norm is ||w||\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("m", abs(margin_width(2.0) - 1.0) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Margin intuition", description: "You can relate weight norm to classification margin." },
  },
  // Phase 3 DL (01–02)
  {
    id: "01-the-perceptron",
    phaseId: 3,
    lessonNumber: 1,
    title: "The Perceptron",
    concept: "output = step(w·x + b). Wrong prediction? nudge weights toward the correct class.",
    build: {
      filename: "perceptron.py",
      starter: "def perceptron_output(weights, x, bias):\n    \"\"\"Return 1 if w·x+b >= 0 else 0.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("pos", perceptron_output([1,1],[1,1], -0.5) == 1)\n    __check("neg", perceptron_output([1,1],[-1,-1], 0) == 0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Perceptron forward", description: "You can run a single neuron forward — atom of every neural network." },
  },
  {
    id: "02-multi-layer-networks",
    phaseId: 3,
    lessonNumber: 2,
    title: "Multi-Layer Networks",
    concept: "Hidden layers compose nonlinear transforms. ReLU(x)=max(0,x) is the default activation — cheap and avoids vanishing gradients.",
    build: {
      filename: "mlp.py",
      starter: "def relu(x):\n    \"\"\"Element-wise ReLU for a list of floats.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("r", relu([-1,0,2]) == [0,0,2])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "ReLU", description: "You can apply ReLU — the activation in most modern hidden layers." },
  },
  // Phase 11 LLM Engineering entry
  {
    id: "01-prompt-engineering",
    phaseId: 11,
    lessonNumber: 1,
    title: "Prompt Engineering",
    concept: "Structure prompts: role, task, constraints, output format. Token budget forces concise context engineering.",
    build: {
      filename: "prompts.py",
      starter: "def estimate_tokens(text):\n    \"\"\"Rough estimate: 1 token ≈ 4 chars (heuristic).\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("t", estimate_tokens("abcd") == 1)\n    __check("8", estimate_tokens("a"*32) == 8)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Token budgeting", description: "You can estimate prompt size — first step in context engineering for LLM apps." },
  },
];

const PHASE_NAMES = {
  0: "Setup & Tooling",
  1: "Math Foundations",
  2: "ML Fundamentals",
  3: "Deep Learning Core",
  11: "LLM Engineering",
};

async function loadCompiled(id) {
  try {
    const raw = await fs.readFile(path.join(COMPILED, `${id}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildLesson(spec, compiled) {
  const motto = compiled?.motto ?? spec.title;
  const problemCards =
    compiled?.steps?.find((s) => s.type === "problem")?.cards ??
    ["Build the exercise below to continue the path."];

  const steps = [
    {
      id: "motto",
      beat: "MOTTO",
      type: "motto",
      gate: "continue",
      title: "Core idea",
      body: motto,
    },
    {
      id: "problem",
      beat: "PROBLEM",
      type: "problem",
      gate: "continue",
      title: "Why this matters",
      cards: problemCards.slice(0, 2),
    },
    {
      id: "concept",
      beat: "CONCEPT",
      type: spec.figure ? "concept" : "concept",
      gate: spec.figure ? "figure" : "continue",
      title: "The concept",
      body: spec.concept,
      ...(spec.figure ? { figure: spec.figure } : {}),
    },
    {
      id: "build",
      beat: "BUILD IT",
      type: "build",
      gate: "tests",
      title: `Implement ${spec.build.filename.replace(".py", "")}`,
      body: "Write the function from scratch in the workspace. Run when ready — all tests must pass.",
      code: {
        language: "python",
        filename: spec.build.filename,
        starter: spec.build.starter,
        tests: spec.build.tests,
      },
    },
    {
      id: "ship",
      beat: "SHIP IT",
      type: "ship",
      gate: "continue",
      title: "Artifact unlocked",
      artifact: spec.artifact,
    },
    {
      id: "complete",
      beat: "COMPLETE",
      type: "complete",
      gate: "continue",
      title: "Lesson complete",
    },
  ];

  return {
    id: spec.id,
    title: spec.title,
    motto,
    phase: {
      id: spec.phaseId,
      name: PHASE_NAMES[spec.phaseId] ?? compiled?.phase?.name ?? `Phase ${spec.phaseId}`,
      lessonNumber: spec.lessonNumber,
    },
    steps,
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const manifest = [];

  for (const spec of SPECS) {
    const compiled = await loadCompiled(spec.id);
    const lesson = buildLesson(spec, compiled);
    const outPath = path.join(OUT, `${spec.id}.json`);
    await fs.writeFile(outPath, JSON.stringify(lesson, null, 2));
    manifest.push({
      id: spec.id,
      title: spec.title,
      phaseId: spec.phaseId,
      phaseName: lesson.phase.name,
      lessonNumber: spec.lessonNumber,
      interactive: true,
      path: `/demo/${spec.id}`,
    });
    console.log(`wrote ${spec.id}`);
  }

  // Merge with existing interactive lessons not in SPECS (hand-authored)
  const existing = await fs.readdir(OUT);
  for (const file of existing) {
    if (!file.endsWith(".json")) continue;
    const id = file.replace(".json", "");
    if (manifest.some((m) => m.id === id)) continue;
    const raw = await fs.readFile(path.join(OUT, file), "utf8");
    const lesson = JSON.parse(raw);
    manifest.push({
      id: lesson.id,
      title: lesson.title,
      phaseId: lesson.phase.id,
      phaseName: lesson.phase.name,
      lessonNumber: lesson.phase.lessonNumber,
      interactive: true,
      path: `/demo/${lesson.id}`,
    });
  }

  manifest.sort((a, b) =>
    a.phaseId === b.phaseId ? a.lessonNumber - b.lessonNumber : a.phaseId - b.phaseId,
  );

  await fs.writeFile(
    MANIFEST,
    JSON.stringify({ generatedAt: new Date().toISOString(), lessons: manifest }, null, 2),
  );

  const registryPath = path.join(ROOT, "apps/web/src/lib/interactive-lessons.registry.ts");
  const imports = manifest
    .map((m, i) => `import lesson_${i} from "@/content/lessons/interactive/${m.id}.json";`)
    .join("\n");
  const entries = manifest.map((m, i) => `  "${m.id}": lesson_${i} as Lesson,`).join("\n");
  const registry = `/* AUTO-GENERATED by scripts/build-interactive-lessons.mjs — do not edit */\nimport type { Lesson } from "@/lib/lesson-types";\n${imports}\n\nexport const INTERACTIVE_LESSONS_REGISTRY: Record<string, Lesson> = {\n${entries}\n};\n`;
  await fs.writeFile(registryPath, registry);

  console.log(`\nManifest: ${manifest.length} interactive lessons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
