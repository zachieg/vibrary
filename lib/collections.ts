export interface Collection {
  slug: string;
  title: string;
  description: string;
  query: { tags?: string[]; ai_tool?: string };
  gradient: string;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "games",
    title: "Vibecoded Games",
    description: "Games built entirely through AI conversations",
    query: { tags: ["game"] },
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    slug: "built-with-claude",
    title: "Built with Claude",
    description: "Projects created with Anthropic's Claude",
    query: { ai_tool: "Claude" },
    gradient: "from-orange-400 to-yellow-500",
  },
  {
    slug: "weekend-projects",
    title: "Weekend Builds",
    description: "Impressive projects built in a weekend or less",
    query: { tags: ["web-app"] },
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    slug: "developer-tools",
    title: "Developer Tools",
    description: "CLIs, extensions, and utilities for devs",
    query: { tags: ["developer-tools", "cli-tool", "chrome-extension"] },
    gradient: "from-sky-400 to-blue-600",
  },
  {
    slug: "finance-productivity",
    title: "Finance & Productivity",
    description: "Tools to manage money and get things done",
    query: { tags: ["finance", "productivity"] },
    gradient: "from-rose-400 to-pink-500",
  },
  {
    slug: "creative-tools",
    title: "Creative Tools",
    description: "Generators, design tools, and artistic experiments",
    query: { tags: ["creative"] },
    gradient: "from-yellow-400 to-orange-500",
  },
];
