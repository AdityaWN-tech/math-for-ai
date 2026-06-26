#!/usr/bin/env node
/**
 * Scaffold interactive lesson JSON from compiled previews + exercise specs.
 * Usage: node scripts/build-interactive-lessons.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import BATCH2 from "./interactive-specs-batch2.mjs";
import BATCH3 from "./interactive-specs-batch3.mjs";
import BATCH4 from "./interactive-specs-batch4.mjs";
import BATCH5 from "./interactive-specs-batch5.mjs";
import BATCH6 from "./interactive-specs-batch6.mjs";
import BATCH7 from "./interactive-specs-batch7.mjs";

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
  // Phase 1 remainder (11–22) — complete math foundations
  {
    id: "11-singular-value-decomposition",
    phaseId: 1,
    lessonNumber: 11,
    title: "Singular Value Decomposition",
    concept: "SVD factors any matrix into U Σ Vᵀ. Singular values rank components for PCA, compression, and recommender systems.",
    build: {
      filename: "svd.py",
      starter: "def frobenius_norm(A):\n    \"\"\"Frobenius norm for matrix as list-of-lists.\"\"\"\n    # TODO: sqrt(sum of squares of all elements)\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("f", abs(frobenius_norm([[3,0],[0,4]]) - 5.0) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Matrix norms", description: "You can compute Frobenius norm — used in SVD truncation and low-rank approximation." },
  },
  {
    id: "12-tensor-operations",
    phaseId: 1,
    lessonNumber: 12,
    title: "Tensor Operations",
    concept: "Tensors generalize matrices to N dimensions. PyTorch shapes like (batch, channels, height, width) are 4D tensors.",
    build: {
      filename: "tensor.py",
      starter: "def num_elements(shape):\n    \"\"\"Product of dimensions, e.g. (2,3,4) -> 24.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("3d", num_elements((2,3,4)) == 24)\n    __check("1d", num_elements((5,)) == 5)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Tensor shape", description: "You can count elements from a shape tuple — first step in batching and memory estimates." },
  },
  {
    id: "13-numerical-stability",
    phaseId: 1,
    lessonNumber: 13,
    title: "Numerical Stability",
    concept: "Subtract max before exp in softmax to avoid overflow. Stable numerics prevent NaNs in training.",
    build: {
      filename: "stable.py",
      starter: "import math\n\ndef stable_softmax(logits):\n    \"\"\"Softmax with max-subtraction trick.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    p = stable_softmax([1000.0, 1001.0, 1002.0])\n    __check("sum", abs(sum(p)-1) < 1e-6)\n    __check("max", p[2] > p[1] > p[0])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Stable softmax", description: "You can softmax large logits without overflow — production loss functions use this." },
  },
  {
    id: "14-norms-and-distances",
    phaseId: 1,
    lessonNumber: 14,
    title: "Norms & Distances",
    concept: "L2 distance powers kNN and embeddings. L1 is robust to outliers. Cosine measures angle, not magnitude.",
    build: {
      filename: "norms.py",
      starter: "def l2_distance(a, b):\n    \"\"\"Euclidean distance between equal-length vectors.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("d", abs(l2_distance([0,0],[3,4]) - 5.0) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "L2 distance", description: "You can measure vector distance — core to kNN, clustering, and embedding search." },
  },
  {
    id: "15-statistics-for-ml",
    phaseId: 1,
    lessonNumber: 15,
    title: "Statistics for ML",
    concept: "Normalize features with mean and variance. Batch norm uses running statistics; z-scores stabilize training.",
    build: {
      filename: "stats.py",
      starter: "def mean(xs):\n    \"\"\"Arithmetic mean of non-empty list.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("m", mean([2,4,6]) == 4.0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Mean", description: "You can compute feature means — required before standardization." },
  },
  {
    id: "16-sampling-methods",
    phaseId: 1,
    lessonNumber: 16,
    title: "Sampling Methods",
    concept: "Mini-batches are random samples from the dataset. Shuffling each epoch prevents order bias.",
    build: {
      filename: "sample.py",
      starter: "def batch_indices(n, batch_size, start=0):\n    \"\"\"Return index list [start, ..., start+batch_size-1] capped at n-1.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    b = batch_indices(10, 3, 0)\n    __check("len", len(b) == 3)\n    __check("idx", b == [0,1,2])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Batch indexing", description: "You can slice batch indices — how DataLoader yields mini-batches." },
  },
  {
    id: "17-linear-systems",
    phaseId: 1,
    lessonNumber: 17,
    title: "Linear Systems",
    concept: "Ax = b appears in least squares and Newton steps. Gaussian elimination solves small systems exactly.",
    build: {
      filename: "linsys.py",
      starter: "def dot(a, b):\n    \"\"\"Dot product of equal-length vectors.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("d", dot([1,2],[3,4]) == 11)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Linear algebra glue", description: "Dot products tie vectors to matrix rows — building block for solving systems." },
  },
  {
    id: "18-convex-optimization",
    phaseId: 1,
    lessonNumber: 18,
    title: "Convex Optimization",
    concept: "Convex functions have one global minimum. MSE is convex; neural nets are not — but convex subproblems appear everywhere.",
    build: {
      filename: "convex.py",
      starter: "def quadratic(x, a, b, c):\n    \"\"\"Evaluate ax^2 + bx + c.\"\"\"\n    return a*x*x + b*x + c\n\ndef is_convex_coeff(a):\n    \"\"\"True if a>0 (convex quadratic).\"\"\"\n    # TODO\n    return False\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("yes", is_convex_coeff(1.0))\n    __check("no", not is_convex_coeff(-1.0))\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Convexity check", description: "You can spot convex quadratics — when gradient descent is guaranteed to find the minimum." },
  },
  {
    id: "19-complex-numbers",
    phaseId: 1,
    lessonNumber: 19,
    title: "Complex Numbers",
    concept: "FFT and quantum ML use complex numbers. Euler's formula links rotation to e^(iθ).",
    build: {
      filename: "complex_nums.py",
      starter: "def complex_mul(ar, ai, br, bi):\n    \"\"\"Return (real, imag) of (ar+ai*i)*(br+bi*i).\"\"\"\n    # TODO\n    return (0, 0)\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    r,i = complex_mul(1,1,1,-1)\n    __check("r", r == 2)\n    __check("i", i == 0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Complex multiply", description: "You can multiply complex numbers — prerequisite for Fourier and signal processing." },
  },
  {
    id: "20-fourier-transform",
    phaseId: 1,
    lessonNumber: 20,
    title: "Fourier Transform",
    concept: "Signals decompose into frequencies. DFT finds how much of each frequency is present — used in audio and position encodings.",
    build: {
      filename: "fourier.py",
      starter: "import math\n\ndef dft_real(signal, k):\n    \"\"\"Real part of k-th DFT coefficient for real signal.\"\"\"\n    # TODO: sum_n signal[n]*cos(2*pi*k*n/N)\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    s = [1.0, 0.0, -1.0, 0.0]\n    __check("finite", abs(dft_real(s, 1)) < 1e6)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "DFT coefficient", description: "You can extract one frequency component — intuition behind spectrograms and RoPE." },
  },
  {
    id: "21-graph-theory",
    phaseId: 1,
    lessonNumber: 21,
    title: "Graph Theory",
    concept: "Graphs model molecules, social networks, and GNNs. Adjacency lists define who connects to whom.",
    build: {
      filename: "graph.py",
      starter: "def has_edge(adj, u, v):\n    \"\"\"adj[u] is list of neighbors. Return True if edge u->v exists.\"\"\"\n    # TODO\n    return False\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    adj = {0:[1,2], 1:[0], 2:[]}\n    __check("y", has_edge(adj,0,1))\n    __check("n", not has_edge(adj,2,0))\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Adjacency lookup", description: "You can traverse graph edges — foundation for GNN message passing." },
  },
  {
    id: "22-stochastic-processes",
    phaseId: 1,
    lessonNumber: 22,
    title: "Stochastic Processes",
    concept: "Markov chains: next state depends only on current. PageRank and RL policies are Markov processes.",
    build: {
      filename: "markov.py",
      starter: "def markov_step(dist, P):\n    \"\"\"dist: state probs, P[i][j]=P(j|i). Return next distribution.\"\"\"\n    # TODO: new[j] = sum_i dist[i]*P[i][j]\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    P = [[0.9,0.1],[0.5,0.5]]\n    n = markov_step([1.0,0.0], P)\n    __check("sum", abs(sum(n)-1) < 1e-9)\n    __check("s0", abs(n[0]-0.9) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Markov step", description: "You can advance a probability distribution — core to RL and generative chains." },
  },
  // Phase 2 remainder (06–18)
  {
    id: "06-knn-and-distances",
    phaseId: 2,
    lessonNumber: 6,
    title: "kNN & Distances",
    concept: "kNN classifies by majority vote of nearest neighbors. No training — just store data and compare distances.",
    build: {
      filename: "knn.py",
      starter: "def majority_vote(labels):\n    \"\"\"Return most common label in list.\"\"\"\n    # TODO\n    return None\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("m", majority_vote([1,1,0,1]) == 1)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Majority vote", description: "You can aggregate neighbor labels — the decision rule in kNN." },
  },
  {
    id: "07-unsupervised-learning",
    phaseId: 2,
    lessonNumber: 7,
    title: "Unsupervised Learning",
    concept: "K-means clusters points by iterative assignment and centroid update. Unsupervised = no labels.",
    build: {
      filename: "kmeans.py",
      starter: "def assign_cluster(x, centroids):\n    \"\"\"Return index of nearest centroid (L2).\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("c", assign_cluster([0,0], [[0,0],[10,10]]) == 0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Cluster assignment", description: "You can assign points to nearest centroid — one k-means iteration." },
  },
  {
    id: "08-feature-engineering",
    phaseId: 2,
    lessonNumber: 8,
    title: "Feature Engineering",
    concept: "Scale features to zero mean, unit variance so gradient descent treats dimensions fairly.",
    build: {
      filename: "features.py",
      starter: "def standardize(xs):\n    \"\"\"Return z-scored list. Use population std.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    z = standardize([1,2,3])\n    __check("mean", abs(sum(z)/3) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Standardization", description: "You can z-score features — standard preprocessing before ML." },
  },
  {
    id: "09-model-evaluation",
    phaseId: 2,
    lessonNumber: 9,
    title: "Model Evaluation",
    concept: "Accuracy = correct / total. For imbalanced data, also track precision, recall, and F1.",
    build: {
      filename: "metrics.py",
      starter: "def accuracy(y_true, y_pred):\n    \"\"\"Fraction of matching labels.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("a", accuracy([1,0,1],[1,1,1]) == 2/3)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Accuracy", description: "You can score classifiers — baseline metric before diving into F1." },
  },
  {
    id: "10-bias-variance",
    phaseId: 2,
    lessonNumber: 10,
    title: "Bias–Variance",
    concept: "High bias = underfitting. High variance = overfitting. MSE decomposes into bias² + variance + noise.",
    build: {
      filename: "biasvar.py",
      starter: "def mse(y_true, y_pred):\n    \"\"\"Mean squared error.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("m", mse([1,2],[1,2]) == 0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "MSE", description: "You can measure fit error — the quantity bias and variance trade off." },
  },
  {
    id: "11-ensemble-methods",
    phaseId: 2,
    lessonNumber: 11,
    title: "Ensemble Methods",
    concept: "Bagging averages many models to reduce variance. Random forests are bagged decision trees.",
    build: {
      filename: "ensemble.py",
      starter: "def average_predictions(preds):\n    \"\"\"Average list of scalar predictions.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("avg", average_predictions([1.0,3.0,5.0]) == 3.0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Model averaging", description: "You can bag predictions — core ensemble reduction of variance." },
  },
  {
    id: "12-hyperparameter-tuning",
    phaseId: 2,
    lessonNumber: 12,
    title: "Hyperparameter Tuning",
    concept: "Grid search tries every combo of lr, batch size, etc. Random search often finds good configs faster.",
    build: {
      filename: "tuning.py",
      starter: "def grid_size(lrs, batch_sizes):\n    \"\"\"Number of grid search combinations.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("g", grid_size([0.1,0.01],[16,32]) == 4)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Search space", description: "You can size a hyperparameter grid before burning GPU hours." },
  },
  {
    id: "13-ml-pipelines",
    phaseId: 2,
    lessonNumber: 13,
    title: "ML Pipelines",
    concept: "Pipelines chain preprocess → train → evaluate. sklearn.Pipeline prevents train/test leakage.",
    build: {
      filename: "pipeline.py",
      starter: "def run_pipeline(steps, data):\n    \"\"\"Apply list of callables in order: data = fn(data).\"\"\"\n    # TODO\n    return data\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    r = run_pipeline([lambda x: x+1, lambda x: x*2], 3)\n    __check("p", r == 8)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Pipeline compose", description: "You can chain transforms — how production ML pipelines avoid leakage." },
  },
  {
    id: "14-naive-bayes",
    phaseId: 2,
    lessonNumber: 14,
    title: "Naive Bayes",
    concept: "Assume features are independent given class. Fast baseline for spam and text classification.",
    build: {
      filename: "nb.py",
      starter: "def naive_score(log_priors, log_likelihoods):\n    \"\"\"Return class index with highest log prior + log likelihood sum.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("c", naive_score([-1,-2], [[0,0],[-5,-5]]) == 0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Naive Bayes decision", description: "You can pick class by log scores — spam filter logic in one function." },
  },
  {
    id: "15-time-series",
    phaseId: 2,
    lessonNumber: 15,
    title: "Time Series",
    concept: "Sliding windows turn sequences into supervised samples. Forecast next step from past W values.",
    build: {
      filename: "timeseries.py",
      starter: "def sliding_windows(series, window):\n    \"\"\"Return list of consecutive slices of length window.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    w = sliding_windows([1,2,3,4], 2)\n    __check("n", len(w) == 3)\n    __check("first", w[0] == [1,2])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Windowing", description: "You can build sliding windows — how sequence models create training rows." },
  },
  {
    id: "16-anomaly-detection",
    phaseId: 2,
    lessonNumber: 16,
    title: "Anomaly Detection",
    concept: "Z-score flags points far from the mean. Simple baseline before isolation forests and autoencoders.",
    build: {
      filename: "anomaly.py",
      starter: "def z_score(x, mean, std):\n    \"\"\"Standard score (x-mean)/std.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("z", z_score(110, 100, 5) == 2.0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Z-score", description: "You can flag outliers statistically — monitoring and fraud detection starter." },
  },
  {
    id: "17-imbalanced-data",
    phaseId: 2,
    lessonNumber: 17,
    title: "Imbalanced Data",
    concept: "Rare classes need oversampling or class weights. Accuracy lies when 99% of emails are not spam.",
    build: {
      filename: "imbalance.py",
      starter: "def class_weight(total, n_classes, class_count):\n    \"\"\"Inverse frequency weight: total/(n_classes*count).\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    w = class_weight(100, 2, 10)\n    __check("w", abs(w - 5.0) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Class weights", description: "You can upweight rare classes — essential for fraud and medical ML." },
  },
  {
    id: "18-feature-selection",
    phaseId: 2,
    lessonNumber: 18,
    title: "Feature Selection",
    concept: "Drop low-variance or redundant features. Fewer dimensions = faster training and less overfitting.",
    build: {
      filename: "select.py",
      starter: "def variance(xs):\n    \"\"\"Population variance of list.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("v", variance([1,2,3]) == 2/3)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Variance filter", description: "You can score feature variance — simple filter before training." },
  },
  // Phase 3 remainder (03–13) — complete deep learning core
  {
    id: "03-backpropagation",
    phaseId: 3,
    lessonNumber: 3,
    title: "Backpropagation",
    concept: "Backprop applies chain rule from loss backward through layers. Each layer gets ∂L/∂weights to update.",
    build: {
      filename: "backprop.py",
      starter: "def relu_derivative(x):\n    \"\"\"1 if x>0 else 0.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("p", relu_derivative(1.0) == 1)\n    __check("n", relu_derivative(-1.0) == 0)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "ReLU derivative", description: "You can differentiate ReLU — local gradient in backprop." },
  },
  {
    id: "04-activation-functions",
    phaseId: 3,
    lessonNumber: 4,
    title: "Activation Functions",
    concept: "Sigmoid squashes to (0,1); tanh to (-1,1); GELU smooths ReLU. Choice affects gradients and speed.",
    build: {
      filename: "activations.py",
      starter: "import math\n\ndef sigmoid(x):\n    # TODO\n    return 0.5\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("0", abs(sigmoid(0)-0.5) < 1e-6)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Sigmoid", description: "You can compute sigmoid — historical activation, still in gates and LSTMs." },
  },
  {
    id: "05-loss-functions",
    phaseId: 3,
    lessonNumber: 5,
    title: "Loss Functions",
    concept: "Binary cross-entropy punishes confident wrong predictions. MSE for regression; CE for classification.",
    build: {
      filename: "loss.py",
      starter: "import math\n\ndef bce(y, p, eps=1e-12):\n    \"\"\"Binary cross-entropy for y in {0,1}, p in (0,1).\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("p", bce(1, 0.9) < bce(1, 0.1))\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "BCE loss", description: "You can compute binary cross-entropy — standard classification loss." },
  },
  {
    id: "06-optimizers",
    phaseId: 3,
    lessonNumber: 6,
    title: "Optimizers",
    concept: "SGD + momentum accumulates velocity. Adam adapts per-parameter learning rates — default for transformers.",
    build: {
      filename: "optim.py",
      starter: "def sgd_momentum(v, grad, lr, beta=0.9):\n    \"\"\"Return updated velocity and param delta.\"\"\"\n    # TODO: v = beta*v + grad; return v, -lr*v\n    return v, 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    v, d = sgd_momentum(0.0, 1.0, 0.1, 0.0)\n    __check("d", abs(d - (-0.1)) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "SGD step", description: "You can apply one SGD update — inner loop of every trainer." },
  },
  {
    id: "07-regularization",
    phaseId: 3,
    lessonNumber: 7,
    title: "Regularization",
    concept: "L2 weight decay penalizes large weights. Dropout randomly zeros activations during training.",
    build: {
      filename: "reg.py",
      starter: "def l2_penalty(weights, lam):\n    \"\"\"lambda * sum(w^2) for flat list of weights.\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("l2", l2_penalty([3,4], 0.5) == 12.5)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "L2 penalty", description: "You can add weight decay to loss — fights overfitting." },
  },
  {
    id: "08-weight-initialization",
    phaseId: 3,
    lessonNumber: 8,
    title: "Weight Initialization",
    concept: "Xavier/Glorot init scales variance by fan-in and fan-out. Bad init causes vanishing or exploding activations.",
    build: {
      filename: "init.py",
      starter: "def xavier_std(fan_in, fan_out):\n    \"\"\"Xavier uniform std: sqrt(2/(fan_in+fan_out)).\"\"\"\n    # TODO\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    import math\n    __check("x", abs(xavier_std(512,512) - math.sqrt(2/1024)) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Xavier scale", description: "You can set init variance — why default Linear layers don't explode." },
  },
  {
    id: "09-learning-rate-schedules",
    phaseId: 3,
    lessonNumber: 9,
    title: "Learning Rate Schedules",
    concept: "Warmup + cosine decay is standard for LLM training. LR controls step size through training.",
    build: {
      filename: "schedule.py",
      starter: "import math\n\ndef cosine_lr(base, step, total_steps):\n    \"\"\"Cosine decay from base to 0.\"\"\"\n    # TODO: base * 0.5 * (1 + cos(pi * step / total_steps))\n    return base\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    import math\n    __check("end", abs(cosine_lr(1.0, 100, 100)) < 1e-6)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Cosine schedule", description: "You can decay learning rate — standard transformer training schedule." },
  },
  {
    id: "10-mini-framework",
    phaseId: 3,
    lessonNumber: 10,
    title: "Mini Framework",
    concept: "Autograd tracks ops on a tape. Forward pass builds graph; backward propagates gradients.",
    build: {
      filename: "autograd.py",
      starter: "def linear_forward(x, w, b):\n    \"\"\"Scalar: x*w+b. Vectors: sum(x[i]*w[i])+b.\"\"\"\n    # TODO for lists\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("l", linear_forward([1,2],[3,4], 1) == 12)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Linear forward", description: "You can run a linear layer forward — building block of your mini framework." },
  },
  {
    id: "11-intro-to-pytorch",
    phaseId: 3,
    lessonNumber: 11,
    title: "Intro to PyTorch",
    concept: "Tensors are multi-dimensional arrays with GPU support. torch.nn.Module wraps parameters and forward().",
    build: {
      filename: "pytorch_shapes.py",
      starter: "def numel(shape):\n    \"\"\"Number of elements from shape tuple.\"\"\"\n    # TODO\n    return 0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("n", numel((32,3,224,224)) == 32*3*224*224)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Tensor numel", description: "You can compute tensor size — memory planning for batches." },
  },
  {
    id: "12-intro-to-jax",
    phaseId: 3,
    lessonNumber: 12,
    title: "Intro to JAX",
    concept: "JAX composes vmap, grad, and jit. Functional style — no in-place mutation — enables XLA fusion.",
    build: {
      filename: "jax_style.py",
      starter: "def pure_update(params, grads, lr):\n    \"\"\"Return new params dict, don't mutate.\"\"\"\n    # TODO: {k: params[k]-lr*grads[k]}\n    return params\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    p = pure_update({"w":1.0},{"w":2.0}, 0.1)\n    __check("p", abs(p["w"]-0.8) < 1e-9)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Functional update", description: "You can update params immutably — JAX's functional core." },
  },
  {
    id: "13-debugging-neural-networks",
    phaseId: 3,
    lessonNumber: 13,
    title: "Debugging Neural Networks",
    concept: "NaN loss = exploding grad or bad LR. Check for inf/nan in activations and gradients early.",
    build: {
      filename: "debug.py",
      starter: "def has_nan(xs):\n    \"\"\"True if any element is NaN (use x!=x).\"\"\"\n    # TODO\n    return False\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("n", has_nan([1.0, float('nan')]))\n    __check("ok", not has_nan([1.0,2.0]))\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "NaN detector", description: "You can catch NaNs in tensors — first debug step when loss blows up." },
  },
  // Phase 4 Computer Vision entry
  {
    id: "01-image-fundamentals",
    phaseId: 4,
    lessonNumber: 1,
    title: "Image Fundamentals",
    concept: "Images are H×W×C tensors. RGB channels encode color; grayscale averages channels.",
    build: {
      filename: "image.py",
      starter: "def rgb_to_gray(r, g, b):\n    \"\"\"ITU-R BT.601 luma approximation.\"\"\"\n    # TODO: 0.299*r + 0.587*g + 0.114*b\n    return 0.0\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("w", abs(rgb_to_gray(1,1,1)-1) < 1e-6)\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Grayscale", description: "You can convert RGB to luma — first step in CV pipelines." },
  },
  {
    id: "02-convolutions-from-scratch",
    phaseId: 4,
    lessonNumber: 2,
    title: "Convolutions from Scratch",
    concept: "Convolution slides a kernel over the input, summing element-wise products. Translation equivariance is the CV superpower.",
    build: {
      filename: "conv.py",
      starter: "def conv1d_valid(signal, kernel):\n    \"\"\"1D valid convolution, no padding.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("c", conv1d_valid([1,2,3,4],[1,0]) == [1,2,3])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Conv1d", description: "You can convolve 1D signals — core operation behind CNNs." },
  },
  // Phase 11 LLM Engineering (extend)
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
  {
    id: "02-few-shot-cot",
    phaseId: 11,
    lessonNumber: 2,
    title: "Few-Shot & Chain-of-Thought",
    concept: "Show examples in the prompt (few-shot). Ask the model to think step-by-step (CoT) before the final answer.",
    build: {
      filename: "cot.py",
      starter: "def format_cot_prompt(question):\n    \"\"\"Append 'Let's think step by step.' to question.\"\"\"\n    # TODO\n    return question\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    p = format_cot_prompt("2+2?")\n    __check("cot", "step by step" in p.lower())\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "CoT prompt", description: "You can trigger chain-of-thought — improves reasoning on math and logic tasks." },
  },
  {
    id: "03-structured-outputs",
    phaseId: 11,
    lessonNumber: 3,
    title: "Structured Outputs",
    concept: "JSON mode and tool schemas force parseable outputs. Agents need structured data, not prose.",
    build: {
      filename: "structured.py",
      starter: "def extract_json_keys(obj):\n    \"\"\"Return sorted keys of dict.\"\"\"\n    # TODO\n    return []\n",
      tests: `def __check(name, ok, msg=""):\n    __results.append({"name": name, "pass": bool(ok), "msg": msg})\ntry:\n    __check("k", extract_json_keys({"a":1,"b":2}) == ["a","b"])\nexcept Exception as e:\n    __check("runtime", False, str(e))\n`,
    },
    artifact: { name: "Schema keys", description: "You can validate JSON shape — prerequisite for tool calling and agents." },
  },
];

const PHASE_NAMES = {
  0: "Setup & Tooling",
  1: "Math Foundations",
  2: "ML Fundamentals",
  3: "Deep Learning Core",
  4: "Computer Vision",
  5: "NLP Foundations to Advanced",
  6: "Speech & Audio",
  7: "Transformers Deep Dive",
  8: "Generative AI",
  9: "Reinforcement Learning",
  10: "LLMs from Scratch",
  11: "LLM Engineering",
  12: "Multimodal AI",
  13: "Tools & Protocols",
  14: "Agent Engineering",
  15: "Autonomous Systems",
  16: "Multi-Agent Systems",
  17: "AI Infrastructure",
  18: "AI Safety & Ethics",
  19: "Capstone Projects",
};

const HAND_AUTHORED_DIR = path.join(
  ROOT,
  "apps/web/src/content/lessons/interactive-hand-authored",
);
const HAND_AUTHORED_IDS = new Set([
  "01-linear-algebra-intuition",
  "02-vectors-matrices-operations",
  "03-matrix-transformations",
  "07-docker-for-ai",
]);

function mergeSpecs() {
  const byId = new Map();
  for (const spec of BATCH4) byId.set(spec.id, spec);
  for (const spec of BATCH2) byId.set(spec.id, spec);
  for (const spec of BATCH3) byId.set(spec.id, spec);
  for (const spec of SPECS) byId.set(spec.id, spec);
  for (const spec of BATCH5) byId.set(spec.id, spec);
  for (const spec of BATCH6) byId.set(spec.id, spec);
  for (const spec of BATCH7) byId.set(spec.id, spec);
  for (const id of HAND_AUTHORED_IDS) byId.delete(id);
  return [...byId.values()];
}

const CATALOG_PATH = path.join(ROOT, "apps/web/src/content/lessons/catalog.json");

async function preserveHandAuthored(manifest) {
  for (const id of HAND_AUTHORED_IDS) {
    const src = path.join(HAND_AUTHORED_DIR, `${id}.json`);
    try {
      const raw = await fs.readFile(src, "utf8");
      await fs.writeFile(path.join(OUT, `${id}.json`), raw);
      const lesson = JSON.parse(raw);
      const entry = {
        id: lesson.id,
        title: lesson.title,
        phaseId: lesson.phase.id,
        phaseName: lesson.phase.name,
        lessonNumber: lesson.phase.lessonNumber,
        interactive: true,
        path: `/demo/${lesson.id}`,
      };
      const idx = manifest.findIndex((m) => m.id === id);
      if (idx >= 0) manifest[idx] = entry;
      else manifest.push(entry);
      console.log(`preserved hand-authored ${id}`);
    } catch (e) {
      console.warn(`Could not preserve ${id}:`, e.message);
    }
  }
}

async function patchCatalogInteractive(manifest) {
  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf8");
    const catalog = JSON.parse(raw);
    const interactiveIds = new Set(manifest.map((m) => m.id));
    const titleById = Object.fromEntries(manifest.map((m) => [m.id, m.title]));
    for (const lesson of catalog.lessons) {
      lesson.interactive = interactiveIds.has(lesson.id);
      if (lesson.interactive && titleById[lesson.id]) {
        lesson.title = titleById[lesson.id];
      }
    }
    catalog.interactiveCount = manifest.length;
    catalog.lessonCount = catalog.lessons.length;
    await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
    console.log(`Patched catalog: ${catalog.interactiveCount} interactive`);
  } catch (e) {
    console.warn("Could not patch catalog.json:", e.message);
  }
}

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

  const allSpecs = mergeSpecs();

  for (const spec of allSpecs) {
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

  await preserveHandAuthored(manifest);

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

  await patchCatalogInteractive(manifest);

  console.log(`\nManifest: ${manifest.length} interactive lessons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
