const GRADIENTS = [
  "from-rose-400 to-purple-500",
  "from-yellow-400 to-rose-500",
  "from-purple-400 to-indigo-600",
  "from-emerald-400 to-cyan-500",
  "from-pink-400 to-orange-400",
  "from-sky-400 to-purple-500",
  "from-yellow-400 to-red-500",
  "from-teal-400 to-blue-500",
];

const TAG_ICON_MAP: Record<string, string> = {
  game: "G",
  finance: "$",
  productivity: "P",
  "developer-tools": ">_",
  "cli-tool": ">_",
  creative: "C",
  "web-app": "W",
  education: "E",
  health: "+",
  social: "S",
  entertainment: "E",
  "landing-page": "L",
  "chrome-extension": "X",
  api: "{}",
  automation: "A",
  "ai-ml": "AI",
  ecommerce: "EC",
  component: "UI",
  "mobile-app": "M",
};

export function getGradient(seed: string): string {
  const hash = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export function getIcon(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_ICON_MAP[tag]) return TAG_ICON_MAP[tag];
  }
  return "V";
}
