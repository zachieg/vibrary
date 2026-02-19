export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { ALL_TAGS } from "@/lib/types";

const GITHUB_TOPIC_MAP: Record<string, string> = {
  // Type
  "web-app": "web-app", webapp: "web-app", website: "web-app", web: "web-app",
  "mobile": "mobile-app", "mobile-app": "mobile-app", ios: "mobile-app", android: "mobile-app", "react-native": "mobile-app",
  component: "component", "ui-component": "component", components: "component",
  api: "api", "rest-api": "api", graphql: "api", backend: "api",
  cli: "cli-tool", "cli-tool": "cli-tool", "command-line": "cli-tool", terminal: "cli-tool",
  game: "game", gaming: "game", gamedev: "game",
  "chrome-extension": "chrome-extension", "browser-extension": "chrome-extension",
  automation: "automation", bot: "automation", script: "automation", scraper: "automation",
  "landing-page": "landing-page", landing: "landing-page", portfolio: "landing-page",
  // Domain
  productivity: "productivity", "task-management": "productivity",
  finance: "finance", fintech: "finance", crypto: "finance",
  health: "health", healthcare: "health", fitness: "health",
  education: "education", learning: "education", elearning: "education",
  entertainment: "entertainment", media: "entertainment", music: "entertainment",
  social: "social", "social-network": "social",
  "developer-tools": "developer-tools", devtools: "developer-tools", hacktoberfest: "developer-tools",
  ai: "ai-ml", ml: "ai-ml", "machine-learning": "ai-ml", "deep-learning": "ai-ml", "ai-ml": "ai-ml", llm: "ai-ml", openai: "ai-ml", langchain: "ai-ml",
  ecommerce: "ecommerce", "e-commerce": "ecommerce", shop: "ecommerce",
  creative: "creative", art: "creative", design: "creative", generative: "creative",
  // Stack
  react: "react", reactjs: "react", "react-app": "react",
  nextjs: "nextjs", "next-js": "nextjs", next: "nextjs",
  svelte: "svelte", sveltekit: "svelte",
  python: "python",
  nodejs: "node", "node-js": "node", node: "node", express: "node",
  tailwind: "tailwind", tailwindcss: "tailwind",
  supabase: "supabase",
  firebase: "firebase",
};

function mapTopicsToTags(topics: string[]): string[] {
  const matched = new Set<string>();
  for (const topic of topics) {
    const mapped = GITHUB_TOPIC_MAP[topic.toLowerCase()];
    if (mapped && (ALL_TAGS as readonly string[]).includes(mapped)) {
      matched.add(mapped);
    }
    if (matched.size >= 5) break;
  }
  return Array.from(matched);
}

function processReadme(raw: string): string {
  let text = raw;
  // Strip YAML frontmatter
  text = text.replace(/^---[\s\S]*?---\n?/, "");
  // Strip badge lines
  text = text.replace(/^\[?\!\[.*?\]\(https?:\/\/[^)]*\)\]?(\(https?:\/\/[^)]*\))?\s*$/gm, "");
  // Strip raw HTML badge tags
  text = text.replace(/<img[^>]*(shields\.io|badge)[^>]*>/gi, "");
  // Collapse blank lines
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();
  // Truncate at 3000 chars on a newline boundary
  if (text.length > 3000) {
    const truncated = text.substring(0, 3000);
    const lastNewline = truncated.lastIndexOf("\n");
    text = (lastNewline > 2500 ? truncated.substring(0, lastNewline) : truncated).trimEnd();
    text += "\n\n*(README truncated — see repository for full content.)*";
  }
  return text;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`github-import:${ip}`, 20, 3_600_000)) {
    return NextResponse.json(
      { error: "Too many imports. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Parse owner/repo from URL
    const cleaned = url.trim().replace(/^https?:\/\//, "").replace(/^github\.com\//, "");
    const parts = cleaned.split("/").filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)" },
        { status: 400 }
      );
    }

    const [owner, repo] = parts;

    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      return NextResponse.json({ error: "Invalid repository path" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Vibrary/1.0",
    };

    const [repoRes, readmeRes] = await Promise.allSettled([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
    ]);

    if (repoRes.status === "rejected" || !repoRes.value.ok) {
      const status = repoRes.status === "fulfilled" ? repoRes.value.status : 502;
      if (status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Make sure it exists and is public." },
          { status: 404 }
        );
      }
      if (status === 403) {
        return NextResponse.json(
          { error: "GitHub rate limit reached. Please try again in an hour." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "Could not fetch repository" }, { status: 502 });
    }

    const repoData = await repoRes.value.json();

    let description = "";
    if (readmeRes.status === "fulfilled" && readmeRes.value.ok) {
      try {
        const readmeData = await readmeRes.value.json();
        if (readmeData.content) {
          const decoded = Buffer.from(readmeData.content, "base64").toString("utf-8");
          description = processReadme(decoded);
        }
      } catch {
        // README parse failure is non-fatal
      }
    }

    const title = repoData.name
      ? String(repoData.name).replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      : "";

    const tagline = repoData.description
      ? String(repoData.description).substring(0, 200)
      : "";

    const tags = mapTopicsToTags(
      Array.isArray(repoData.topics) ? repoData.topics : []
    );

    const demoUrl =
      repoData.homepage && String(repoData.homepage).trim() !== ""
        ? String(repoData.homepage).trim()
        : "";

    return NextResponse.json({
      title,
      tagline,
      description,
      tags,
      demoUrl,
      repoUrl: `https://github.com/${owner}/${repo}`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
