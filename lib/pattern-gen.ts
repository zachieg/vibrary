// Seeded PRNG (Mulberry32)
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// DJB2 string hash
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function createRng(seed: string) {
  const rng = mulberry32(hashString(seed));
  return {
    next: () => rng(),
    range: (min: number, max: number) => min + rng() * (max - min),
    int: (min: number, max: number) => Math.floor(min + rng() * (max - min + 1)),
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)],
    bool: (probability = 0.5) => rng() < probability,
  };
}

// --- Color themes ---

interface ColorTheme {
  bg: [string, string];
  shapes: string[];
}

const COLOR_THEMES: ColorTheme[] = [
  // Coral family
  { bg: ["#FF6B6B", "#FF8E53"], shapes: ["#FFD93D", "#FF6B6B", "#FFFFFF", "#FFF5E4"] },
  { bg: ["#FF6B6B", "#845EF7"], shapes: ["#FF6B6B", "#C084FC", "#FFFFFF", "#FFE4E6"] },
  { bg: ["#FF6B6B", "#F472B6"], shapes: ["#FCA5A5", "#FBBF24", "#FFFFFF", "#FFF1F2"] },
  { bg: ["#E11D48", "#FB923C"], shapes: ["#FECDD3", "#FB923C", "#FFFFFF", "#FEF3C7"] },
  // Violet family
  { bg: ["#845EF7", "#6366F1"], shapes: ["#A78BFA", "#845EF7", "#FFFFFF", "#EDE9FE"] },
  { bg: ["#845EF7", "#06B6D4"], shapes: ["#845EF7", "#22D3EE", "#FFFFFF", "#F0F9FF"] },
  { bg: ["#7C3AED", "#EC4899"], shapes: ["#C084FC", "#F9A8D4", "#FFFFFF", "#FDF4FF"] },
  { bg: ["#6366F1", "#8B5CF6"], shapes: ["#818CF8", "#A78BFA", "#FFFFFF", "#EEF2FF"] },
  // Amber/warm family
  { bg: ["#FFB347", "#FF6B6B"], shapes: ["#FFB347", "#FBBF24", "#FFFFFF", "#FFF7ED"] },
  { bg: ["#FFB347", "#F472B6"], shapes: ["#FFB347", "#F472B6", "#FFFFFF", "#FFF1F2"] },
  { bg: ["#F59E0B", "#EF4444"], shapes: ["#FCD34D", "#FCA5A5", "#FFFFFF", "#FFFBEB"] },
  { bg: ["#FB923C", "#A855F7"], shapes: ["#FDBA74", "#C084FC", "#FFFFFF", "#FFF7ED"] },
  // Nature/cool family
  { bg: ["#10B981", "#06B6D4"], shapes: ["#34D399", "#22D3EE", "#FFFFFF", "#ECFDF5"] },
  { bg: ["#10B981", "#845EF7"], shapes: ["#34D399", "#A78BFA", "#FFFFFF", "#F5F3FF"] },
  { bg: ["#14B8A6", "#3B82F6"], shapes: ["#5EEAD4", "#93C5FD", "#FFFFFF", "#F0FDFA"] },
  { bg: ["#059669", "#0891B2"], shapes: ["#6EE7B7", "#67E8F9", "#FFFFFF", "#ECFDF5"] },
  // Blue/sky family
  { bg: ["#3B82F6", "#8B5CF6"], shapes: ["#93C5FD", "#C084FC", "#FFFFFF", "#EFF6FF"] },
  { bg: ["#0EA5E9", "#6366F1"], shapes: ["#7DD3FC", "#818CF8", "#FFFFFF", "#F0F9FF"] },
  { bg: ["#2563EB", "#EC4899"], shapes: ["#93C5FD", "#F9A8D4", "#FFFFFF", "#EFF6FF"] },
  { bg: ["#0284C7", "#10B981"], shapes: ["#7DD3FC", "#6EE7B7", "#FFFFFF", "#F0F9FF"] },
  // Pink/rose family
  { bg: ["#EC4899", "#F97316"], shapes: ["#F9A8D4", "#FDBA74", "#FFFFFF", "#FDF2F8"] },
  { bg: ["#DB2777", "#7C3AED"], shapes: ["#F472B6", "#A78BFA", "#FFFFFF", "#FDF4FF"] },
  // Dark/bold family
  { bg: ["#4F46E5", "#1E1B4B"], shapes: ["#818CF8", "#6366F1", "#FFFFFF", "#C7D2FE"] },
  { bg: ["#7E22CE", "#1E1B4B"], shapes: ["#A855F7", "#C084FC", "#FFFFFF", "#E9D5FF"] },
];

// --- Mood system ---

type Mood = "playful" | "structured" | "organic" | "minimal" | "bold";

function getMood(tags: string[]): Mood {
  const tagSet = new Set(tags);
  if (tagSet.has("game") || tagSet.has("entertainment")) return "playful";
  if (tagSet.has("developer-tools") || tagSet.has("cli-tool") || tagSet.has("api")) return "structured";
  if (tagSet.has("creative") || tagSet.has("health")) return "organic";
  if (tagSet.has("landing-page") || tagSet.has("component")) return "minimal";
  if (tagSet.has("ai-ml") || tagSet.has("automation")) return "bold";
  return "organic";
}

// --- Shape types ---

type ShapeType = "circle" | "rect" | "triangle" | "line" | "ring" | "arc" | "dot-grid";

export interface Shape {
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  strokeOnly: boolean;
  strokeWidth: number;
}

export interface PatternData {
  shapes: Shape[];
  bgGradient: [string, string];
  gradientAngle: number;
}

// Weighted shape type selection based on mood
const MOOD_WEIGHTS: Record<Mood, [ShapeType, number][]> = {
  playful: [["circle", 30], ["triangle", 20], ["ring", 15], ["dot-grid", 15], ["rect", 10], ["arc", 10], ["line", 0]],
  structured: [["rect", 30], ["line", 25], ["dot-grid", 20], ["circle", 10], ["ring", 10], ["triangle", 5], ["arc", 0]],
  organic: [["circle", 25], ["arc", 20], ["ring", 20], ["triangle", 10], ["line", 10], ["rect", 10], ["dot-grid", 5]],
  minimal: [["circle", 30], ["line", 25], ["ring", 20], ["rect", 15], ["arc", 10], ["triangle", 0], ["dot-grid", 0]],
  bold: [["ring", 25], ["circle", 20], ["rect", 20], ["triangle", 15], ["arc", 10], ["line", 10], ["dot-grid", 0]],
};

function weightedPick(rng: ReturnType<typeof createRng>, weights: [ShapeType, number][]): ShapeType {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let r = rng.range(0, total);
  for (const [type, weight] of weights) {
    r -= weight;
    if (r <= 0) return type;
  }
  return weights[0][0];
}

function generateShape(
  rng: ReturnType<typeof createRng>,
  theme: ColorTheme,
  mood: Mood,
  _index: number,
): Shape {
  const type = weightedPick(rng, MOOD_WEIGHTS[mood]);

  let x = rng.range(5, 95);
  let y = rng.range(5, 95);
  if (mood === "structured") {
    x = Math.round(x / 12.5) * 12.5;
    y = Math.round(y / 12.5) * 12.5;
  }

  const sizeRanges: Record<Mood, [number, number]> = {
    minimal: [3, 15],
    bold: [8, 35],
    playful: [5, 28],
    structured: [4, 22],
    organic: [4, 25],
  };
  const [sMin, sMax] = sizeRanges[mood];
  const size = rng.range(sMin, sMax);

  const rotation = mood === "structured"
    ? rng.pick([0, 45, 90, 135] as const)
    : rng.range(0, 360);

  const opMax = mood === "bold" ? 0.5 : mood === "minimal" ? 0.25 : 0.4;
  const opacity = rng.range(0.08, opMax);

  const color = rng.pick(theme.shapes);
  const strokeOnly = rng.bool(0.4);
  const strokeWidth = rng.range(1, 3);

  return { type, x, y, size, rotation, opacity, color, strokeOnly, strokeWidth };
}

function generateFeatureShape(
  rng: ReturnType<typeof createRng>,
  theme: ColorTheme,
): Shape {
  return {
    type: rng.pick(["circle", "ring", "rect"] as const),
    x: rng.range(25, 75),
    y: rng.range(25, 75),
    size: rng.range(20, 40),
    rotation: rng.range(0, 180),
    opacity: rng.range(0.08, 0.2),
    color: rng.pick(theme.shapes),
    strokeOnly: rng.bool(0.6),
    strokeWidth: rng.range(2, 4),
  };
}

export function generatePattern(seed: string, tags: string[]): PatternData {
  const rng = createRng(seed);

  // Pick theme deterministically
  const theme = rng.pick(COLOR_THEMES);

  // Determine mood from tags
  const mood = getMood(tags);

  // Shape count varies by mood
  const countRanges: Record<Mood, [number, number]> = {
    minimal: [6, 10],
    bold: [10, 16],
    playful: [10, 18],
    structured: [8, 14],
    organic: [8, 16],
  };
  const [cMin, cMax] = countRanges[mood];
  const shapeCount = rng.int(cMin, cMax);

  const shapes: Shape[] = [];
  for (let i = 0; i < shapeCount; i++) {
    shapes.push(generateShape(rng, theme, mood, i));
  }

  // Add one feature shape
  shapes.push(generateFeatureShape(rng, theme));

  return {
    shapes,
    bgGradient: theme.bg,
    gradientAngle: rng.range(120, 200),
  };
}
