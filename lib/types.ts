export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  demo_url: string | null;
  screenshot_url: string | null;
  tags: string[];
  ai_tool_used: string;
  submitter_name: string;
  submitter_email: string;
  submitter_url: string | null;
  featured: boolean;
  status: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  demo_url?: string | null;
  screenshot_url?: string | null;
  tags: string[];
  ai_tool_used: string;
  submitter_name: string;
  submitter_email: string;
  submitter_url?: string | null;
}

export interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  tags: string[];
  requester_name: string;
  requester_email: string;
  status: string;
  fulfilled_by: string | null;
  upvotes: number;
  created_at: string;
}

export interface ProjectRequestInsert {
  title: string;
  description: string;
  tags: string[];
  requester_name: string;
  requester_email: string;
}

export interface ProjectListResponse {
  projects: Omit<Project, "submitter_email">[];
  total: number;
  limit: number;
  offset: number;
}

export interface RequestListResponse {
  requests: Omit<ProjectRequest, "requester_email">[];
  total: number;
  limit: number;
  offset: number;
}

export const AI_TOOLS = [
  "Claude",
  "GPT-4",
  "GPT-4o",
  "Cursor",
  "v0",
  "Copilot",
  "Gemini",
  "Replit AI",
  "Windsurf",
  "Bolt",
  "Lovable",
  "Other",
] as const;

export const PRESET_TAGS = {
  type: [
    "web-app",
    "mobile-app",
    "component",
    "api",
    "cli-tool",
    "game",
    "chrome-extension",
    "automation",
    "landing-page",
  ],
  domain: [
    "productivity",
    "finance",
    "health",
    "education",
    "entertainment",
    "social",
    "developer-tools",
    "ai-ml",
    "ecommerce",
    "creative",
  ],
  stack: [
    "react",
    "nextjs",
    "svelte",
    "python",
    "node",
    "tailwind",
    "supabase",
    "firebase",
  ],
} as const;

export const ALL_TAGS = [
  ...PRESET_TAGS.type,
  ...PRESET_TAGS.domain,
  ...PRESET_TAGS.stack,
];
