import type { MedalTier } from "@/lib/progress";

export type GameId =
  | "span-archer"
  | "matrix-morph"
  | "descent-golf"
  | "cosine-radar"
  | "bayes-detective"
  | "eigen-hunter";

export interface ApplyMission {
  title: string;
  /** Why an AI engineer would write this exact code. */
  story: string;
  filename: string;
  starter: string;
  /** Python appended after the player's code. Use _check(name, fn) to register a test. */
  harness: string;
}

export interface GameDef {
  id: GameId;
  title: string;
  tagline: string;
  zone: "Vectors" | "Matrices" | "Calculus" | "Probability";
  view: "3D" | "2D";
  lessonId: string;
  lessonTitle: string;
  /** Short list shown on the intro card. */
  howToPlay: string[];
  /** The one idea the game should leave in your head. */
  insight: string;
  /** Where this shows up in real AI systems. */
  inTheWild: string;
  apply: ApplyMission;
}

/** Score is always 0–100. */
export const MEDAL_THRESHOLDS: Record<MedalTier, number> = { bronze: 50, silver: 75, gold: 90 };
export const MEDAL_XP: Record<MedalTier, number> = { bronze: 20, silver: 45, gold: 80 };
export const MEDAL_ORDER: MedalTier[] = ["bronze", "silver", "gold"];

export function medalForScore(score: number): MedalTier | null {
  if (score >= MEDAL_THRESHOLDS.gold) return "gold";
  if (score >= MEDAL_THRESHOLDS.silver) return "silver";
  if (score >= MEDAL_THRESHOLDS.bronze) return "bronze";
  return null;
}

export function medalRank(medal: MedalTier | null | undefined): number {
  return medal ? MEDAL_ORDER.indexOf(medal) : -1;
}

const CHECK_HELPER = `
def _check(name, fn):
    try:
        ok = bool(fn())
        __results.append({"name": name, "pass": ok, "msg": "" if ok else "Not quite. Check your math."})
    except Exception as e:
        __results.append({"name": name, "pass": False, "msg": f"{type(e).__name__}: {e}"})
`;

export const GAMES: GameDef[] = [
  {
    id: "span-archer",
    title: "Span Archer",
    tagline: "Hit 3D targets using only two arrows and a pair of multipliers.",
    zone: "Vectors",
    view: "3D",
    lessonId: "01-linear-algebra-intuition",
    lessonTitle: "Linear Algebra Intuition",
    howToPlay: [
      "You get two vectors, a (blue) and b (orange).",
      "Pick multipliers s and t. Your shot lands at s·a + t·b.",
      "Hit the glowing target. Fewer tries = more points.",
      "Drag to orbit the 3D view and see the plane the two vectors can reach.",
    ],
    insight:
      "Every point you can hit lies on one flat plane: the span of a and b. Linear combinations can never leave it.",
    inTheWild:
      "Embeddings are linear combinations. 'king − man + woman ≈ queen' is exactly s·a + t·b + u·c in a 300-D space.",
    apply: {
      title: "Word-vector analogies",
      story:
        "Word embeddings turn words into vectors, so meaning becomes arithmetic. Write the vector helpers, then solve 'king − man + woman = ?' by finding the nearest word.",
      filename: "analogy.py",
      starter: `# Tiny 3-D "embeddings": [royalty, masculinity, femininity]
WORDS = {
    "king":  [0.9, 0.8, 0.1],
    "queen": [0.9, 0.1, 0.8],
    "man":   [0.1, 0.9, 0.1],
    "woman": [0.1, 0.1, 0.9],
    "apple": [0.0, 0.2, 0.2],
}

def add(a, b):
    # return the element-wise sum of a and b
    pass

def scale(s, a):
    # return s * a (every element multiplied by s)
    pass

def distance(a, b):
    # Euclidean distance: sqrt of the sum of squared differences
    pass

def analogy(a, b, c):
    # "a is to b as ? is to c"  ->  a - b + c
    # hint: a - b  ==  add(a, scale(-1, b))
    pass

def nearest(vec, exclude=()):
    # return the word in WORDS closest to vec, skipping words in exclude
    pass

guess = analogy(WORDS["king"], WORDS["man"], WORDS["woman"])
print("king - man + woman ->", nearest(guess, exclude=("king", "man", "woman")))
`,
      harness: `${CHECK_HELPER}
_check("add([1,2,3],[4,5,6]) == [5,7,9]", lambda: list(add([1,2,3],[4,5,6])) == [5,7,9])
_check("scale(2,[1,-1,0.5]) == [2,-2,1]", lambda: list(scale(2,[1,-1,0.5])) == [2,-2,1])
_check("distance([0,0,0],[3,4,0]) == 5", lambda: abs(distance([0,0,0],[3,4,0]) - 5) < 1e-9)
_check("analogy is a - b + c", lambda: all(abs(x-y) < 1e-9 for x, y in zip(analogy([1,1,1],[1,0,0],[0,0,2]), [0,1,3])))
_check("king - man + woman lands nearest 'queen'", lambda: nearest(analogy(WORDS["king"], WORDS["man"], WORDS["woman"]), exclude=("king","man","woman")) == "queen")
`,
    },
  },
  {
    id: "matrix-morph",
    title: "Matrix Morph",
    tagline: "Bend a 3D cube into the ghost shape by building the matrix.",
    zone: "Matrices",
    view: "3D",
    lessonId: "03-matrix-transformations",
    lessonTitle: "Matrix Transformations",
    howToPlay: [
      "A ghost shape shows a cube after some secret matrix acted on it.",
      "Edit the 3×3 matrix until your solid cube matches the ghost.",
      "Watch det(M): it's how much the volume grows. Negative means the cube flipped inside out.",
      "Stuck? A hint shows where each axis arrow has to land, but it costs points.",
    ],
    insight:
      "Column j of a matrix is where the j-th axis lands. Know where x, y and z go and you know the whole transform.",
    inTheWild:
      "Every neural-network layer starts with a matrix that reshapes space. Data augmentation (rotate, flip, shear) uses these same matrices.",
    apply: {
      title: "Image augmentation matrices",
      story:
        "Vision models train on rotated and flipped copies of images. Build the transform matrices and apply them to a sprite's corner points.",
      filename: "augment.py",
      starter: `def matvec(M, v):
    # multiply a 2x2 matrix M (list of rows) by a 2-vector v
    pass

def apply(M, points):
    # apply M to every point in the list
    pass

# 2x2 matrices as lists of rows
ROTATE_90 = None   # turns (1,0) into (0,1) and (0,1) into (-1,0)
FLIP_X    = None   # mirror left-right: (x, y) -> (-x, y)
SCALE_2   = None   # double both coordinates

def det(M):
    # determinant of a 2x2 matrix: ad - bc
    pass

square = [(0,0), (1,0), (1,1), (0,1)]
print("rotated:", apply(ROTATE_90, square))
`,
      harness: `${CHECK_HELPER}
_check("matvec([[1,2],[3,4]],[1,1]) == [3,7]", lambda: list(matvec([[1,2],[3,4]],[1,1])) == [3,7])
_check("ROTATE_90 sends (1,0) to (0,1)", lambda: list(matvec(ROTATE_90,[1,0])) == [0,1])
_check("ROTATE_90 sends (0,1) to (-1,0)", lambda: list(matvec(ROTATE_90,[0,1])) == [-1,0])
_check("FLIP_X mirrors (2,3) to (-2,3)", lambda: list(matvec(FLIP_X,[2,3])) == [-2,3])
_check("apply() maps every point", lambda: [list(p) for p in apply(SCALE_2,[(1,1),(0,2)])] == [[2,2],[0,4]])
_check("det: rotation keeps area, flip reverses it", lambda: det(ROTATE_90) == 1 and det(FLIP_X) == -1 and det(SCALE_2) == 4)
`,
    },
  },
  {
    id: "descent-golf",
    title: "Descent Golf",
    tagline: "Putt a ball down a 3D loss landscape. Your club is the learning rate.",
    zone: "Calculus",
    view: "3D",
    lessonId: "08-optimization",
    lessonTitle: "Optimization",
    howToPlay: [
      "The ball rolls downhill by gradient descent: every step moves it by −lr × slope.",
      "Pick a learning rate (and momentum on later holes), then putt.",
      "Sink it in the hole (the minimum) in as few steps as possible.",
      "Too small = crawls. Too big = bounces out and diverges.",
    ],
    insight:
      "The best learning rate depends on the steepest direction of the bowl. A narrow ravine punishes big steps; momentum helps you cruise along it.",
    inTheWild:
      "Training any model means doing exactly this in millions of dimensions. Learning-rate schedules and Adam's momentum exist because of ravines.",
    apply: {
      title: "Fit a price line with gradient descent",
      story:
        "Predict house prices from size. Write the loss and one gradient step, then train until the line fits.",
      filename: "fit_line.py",
      starter: `# (size in 100 m², price in $100k). The true rule is price = 2*size + 1
DATA = [(1, 3), (2, 5), (3, 7), (4, 9), (5, 11)]

def predict(w, b, x):
    return w * x + b

def loss(w, b, data):
    # mean squared error: average of (prediction - y)^2
    pass

def gradients(w, b, data):
    # return (dL/dw, dL/db) for the MSE loss
    # dL/dw = mean(2 * (pred - y) * x), dL/db = mean(2 * (pred - y))
    pass

def step(w, b, lr, data):
    # one gradient-descent step: move against the gradient
    pass

def train(lr=0.02, steps=2000):
    w, b = 0.0, 0.0
    for _ in range(steps):
        w, b = step(w, b, lr, DATA)
    return w, b

if step(0.0, 0.0, 0.01, DATA) is not None:
    w, b = train()
    print(f"w={w:.3f}  b={b:.3f}  loss={loss(w, b, DATA):.5f}")
`,
      harness: `${CHECK_HELPER}
_check("loss at w=2,b=1 is 0", lambda: abs(loss(2, 1, DATA)) < 1e-12)
_check("loss at w=0,b=0 is 57", lambda: abs(loss(0, 0, DATA) - 57) < 1e-9)
_check("gradients at w=0,b=0 point the right way", lambda: (lambda g: abs(g[0] + 50) < 1e-9 and abs(g[1] + 14) < 1e-9)(gradients(0, 0, DATA)))
_check("one step lowers the loss", lambda: loss(*step(0.0, 0.0, 0.01, DATA), DATA) < loss(0, 0, DATA))
_check("training recovers w≈2, b≈1", lambda: (lambda wb: abs(wb[0]-2) < 0.05 and abs(wb[1]-1) < 0.15)(train()))
`,
    },
  },
  {
    id: "cosine-radar",
    title: "Cosine Radar",
    tagline: "Speed round: read the angle, call the similarity.",
    zone: "Vectors",
    view: "2D",
    lessonId: "14-norms-and-distances",
    lessonTitle: "Norms & Distances",
    howToPlay: [
      "Two arrows appear on the radar.",
      "Guess their cosine similarity: +1 means the same direction, 0 means perpendicular, −1 means opposite.",
      "Lock in fast. Accurate, quick answers build a combo.",
      "Length doesn't matter, only the angle. Don't let long arrows fool you.",
    ],
    insight:
      "cos θ = a·b / (|a||b|). It ignores length and measures direction only. That's why it's the default for comparing embeddings.",
    inTheWild:
      "Semantic search, RAG retrieval and recommendations all rank results by cosine similarity between embedding vectors.",
    apply: {
      title: "Mini semantic search",
      story:
        "Build the core of a RAG retriever: score every document against the query with cosine similarity and return the best match.",
      filename: "search.py",
      starter: `import math

# pretend embeddings: [sports, cooking, code]
DOCS = {
    "football-recap":  [0.9, 0.1, 0.0],
    "pasta-recipe":    [0.0, 0.95, 0.1],
    "python-tutorial": [0.1, 0.0, 0.99],
    "chef-knives":     [0.1, 0.7, 0.05],
}

def dot(a, b):
    pass

def norm(a):
    pass

def cosine(a, b):
    # a·b / (|a| |b|)
    pass

def search(query, docs, k=1):
    # return the ids of the k docs with the highest cosine similarity, best first
    pass

print(search([0.0, 0.9, 0.08], DOCS, k=2))
`,
      harness: `${CHECK_HELPER}
_check("dot([1,2,3],[4,5,6]) == 32", lambda: dot([1,2,3],[4,5,6]) == 32)
_check("norm([3,4]) == 5", lambda: abs(norm([3,4]) - 5) < 1e-9)
_check("cosine ignores length", lambda: abs(cosine([1,0],[5,0]) - 1) < 1e-9)
_check("perpendicular vectors score 0", lambda: abs(cosine([1,0],[0,3])) < 1e-9)
_check("opposite vectors score -1", lambda: abs(cosine([1,1],[-2,-2]) + 1) < 1e-9)
_check("cooking query finds the cooking docs", lambda: list(search([0.0, 0.9, 0.08], DOCS, k=2)) == ["pasta-recipe", "chef-knives"])
`,
    },
  },
  {
    id: "bayes-detective",
    title: "Bayes Detective",
    tagline: "The alarm went off. How likely is it really guilty?",
    zone: "Probability",
    view: "2D",
    lessonId: "07-bayes-theorem",
    lessonTitle: "Bayes' Theorem",
    howToPlay: [
      "Each case gives a base rate and how reliable the evidence is.",
      "Estimate the real probability after the evidence fires.",
      "The reveal shows 1,000 cases as dots. Count them and the answer appears.",
      "Most people overshoot. Watch the base rate.",
    ],
    insight:
      "A rare event plus an imperfect test usually means most alarms are false alarms. The prior matters as much as the evidence.",
    inTheWild:
      "Spam filters, fraud alerts, AI-text detectors and medical models all hit this base-rate trap. Calibrating them is Bayes in production.",
    apply: {
      title: "Naive spam filter",
      story:
        "Turn Bayes' theorem into a real classifier: update the spam probability one word at a time.",
      filename: "spam.py",
      starter: `def posterior(prior, p_e_given_h, p_e_given_not_h):
    # Bayes: P(H|E) = P(E|H) P(H) / P(E)
    # where P(E) = P(E|H) P(H) + P(E|not H) P(not H)
    pass

# P(word | spam), P(word | ham)
WORD_STATS = {
    "free":    (0.30, 0.02),
    "winner":  (0.20, 0.01),
    "meeting": (0.02, 0.15),
    "invoice": (0.05, 0.10),
}

def spam_probability(words, prior=0.2):
    # start from the prior and apply posterior() once per known word
    pass

def is_spam(words, threshold=0.5):
    pass

print(spam_probability(["free", "winner"]))
`,
      harness: `${CHECK_HELPER}
_check("posterior(0.5, 0.9, 0.1) == 0.9", lambda: abs(posterior(0.5, 0.9, 0.1) - 0.9) < 1e-9)
_check("rare disease: posterior(0.01, 0.9, 0.09) ≈ 0.092", lambda: abs(posterior(0.01, 0.9, 0.09) - 0.0917431) < 1e-4)
_check("unknown words leave the prior unchanged", lambda: abs(spam_probability(["hello"], prior=0.2) - 0.2) < 1e-9)
_check("'free winner' is spam", lambda: is_spam(["free", "winner"]))
_check("'meeting invoice' is not spam", lambda: not is_spam(["meeting", "invoice"]))
`,
    },
  },
  {
    id: "eigen-hunter",
    title: "Eigen Hunter",
    tagline: "Find the secret directions a matrix only stretches and never turns.",
    zone: "Matrices",
    view: "2D",
    lessonId: "10-dimensionality-reduction",
    lessonTitle: "Dimensionality Reduction",
    howToPlay: [
      "Rotate your probe vector v (blue). The matrix turns it into Av (orange).",
      "Most directions get knocked sideways. Hunt for one where Av points along v.",
      "Lock it in when the two arrows line up. Smaller angle error = more points.",
      "The reveal tells you the stretch factor λ.",
    ],
    insight:
      "Eigenvectors are the directions a matrix only scales: Av = λv. They are the 'natural axes' of the transformation.",
    inTheWild:
      "PCA keeps the top eigenvectors of the covariance matrix to compress data. PageRank is an eigenvector, and so is the stable state of a Markov chain.",
    apply: {
      title: "PCA by power iteration",
      story:
        "Find the main direction of a cloud of points (the first principal component) the way real libraries do: repeatedly multiply and normalize.",
      filename: "pca.py",
      starter: `import math

# points stretched along the direction (1, 1)
POINTS = [(2, 2.1), (-1, -0.8), (3, 2.9), (-2, -2.2), (0.5, 0.4), (-3, -3.1)]

def covariance(points):
    # 2x2 covariance matrix [[var_x, cov_xy], [cov_xy, var_y]]
    # subtract the mean of x and y first, then divide by n
    pass

def matvec(M, v):
    pass

def normalize(v):
    pass

def power_iteration(M, steps=100):
    # start from [1, 0]; repeat v = normalize(M v)
    pass

pc1 = power_iteration(covariance(POINTS))
print("first principal component:", pc1)
`,
      harness: `${CHECK_HELPER}
_check("normalize([3,4]) == [0.6,0.8]", lambda: all(abs(a-b) < 1e-9 for a, b in zip(normalize([3,4]), [0.6,0.8])))
_check("matvec([[2,0],[0,3]],[1,1]) == [2,3]", lambda: list(matvec([[2,0],[0,3]],[1,1])) == [2,3])
_check("covariance is symmetric", lambda: (lambda C: abs(C[0][1]-C[1][0]) < 1e-12)(covariance(POINTS)))
_check("power iteration on [[2,0],[0,1]] finds the x-axis", lambda: (lambda v: abs(abs(v[0]) - 1) < 1e-6)(power_iteration([[2,0],[0,1]])))
_check("PC1 points along (1,1)", lambda: (lambda v: abs(abs(v[0]) - abs(v[1])) < 0.05 and abs(v[0]*v[0]+v[1]*v[1]-1) < 1e-6)(power_iteration(covariance(POINTS))))
`,
    },
  },
];

export function gameById(id: string): GameDef | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Same game for everyone on a given (UTC) day. */
export function dailyGameId(dateKey: string): GameId {
  let h = 0;
  for (const ch of dateKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GAMES[h % GAMES.length].id;
}
