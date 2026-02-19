import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://vibrary.vercel.app/api/v1";

const server = new McpServer({
  name: "vibrary",
  version: "1.1.0",
});

server.tool(
  "search_projects",
  "Search Vibrary for vibecoded projects. Returns projects matching your query, filterable by keyword, tags, AI tool used, and sort order. Use this to find existing code before building from scratch.",
  {
    q: z.string().optional().describe("Search keyword (searches title, tagline, description)"),
    tags: z.string().optional().describe("Comma-separated tags to filter by (e.g. 'react,nextjs,web-app')"),
    ai_tool: z.string().optional().describe("Filter by AI tool used (e.g. 'Claude', 'GPT-4', 'Cursor', 'v0')"),
    setup_difficulty: z.enum(["trivial", "easy", "moderate", "complex"]).optional().describe("Filter by setup difficulty level"),
    sort: z.enum(["newest", "popular"]).optional().describe("Sort order: 'newest' (default) or 'popular' (by upvotes)"),
    limit: z.number().optional().describe("Max results to return (default 20, max 50)"),
  },
  async (params) => {
    const url = new URL(`${API_BASE}/projects`);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.tags) url.searchParams.set("tags", params.tags);
    if (params.ai_tool) url.searchParams.set("ai_tool", params.ai_tool);
    if (params.setup_difficulty) url.searchParams.set("setup_difficulty", params.setup_difficulty);
    if (params.sort) url.searchParams.set("sort", params.sort);
    if (params.limit) url.searchParams.set("limit", String(params.limit));

    const res = await fetch(url.toString());
    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `API error: ${res.status} ${res.statusText}` }] };
    }

    const data = await res.json();
    const { projects, total } = data;

    if (projects.length === 0) {
      return { content: [{ type: "text" as const, text: "No projects found matching your search." }] };
    }

    const lines = projects.map((p: Record<string, unknown>) =>
      [
        `## ${p.title}`,
        p.tagline,
        `Tags: ${(p.tags as string[]).join(", ")}`,
        `AI Tool: ${p.ai_tool_used}`,
        p.setup_difficulty ? `Setup: ${p.setup_difficulty}` : null,
        `Upvotes: ${p.upvotes}`,
        p.repo_url ? `Repo: ${p.repo_url}` : null,
        p.demo_url ? `Demo: ${p.demo_url}` : null,
        `Details: https://vibrary.vercel.app/project/${p.slug}`,
      ]
        .filter(Boolean)
        .join("\n")
    );

    const text = `Found ${total} project(s). Showing ${projects.length}:\n\n${lines.join("\n\n---\n\n")}`;
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "get_project",
  "Get full details for a specific Vibrary project by its slug. Returns the complete description, repo URL, demo URL, and all metadata.",
  {
    slug: z.string().describe("The project slug (from the URL, e.g. 'my-cool-app-abc123')"),
  },
  async (params) => {
    const res = await fetch(`${API_BASE}/projects/${params.slug}`);
    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `Project not found: ${params.slug}` }] };
    }

    const p = await res.json();
    const text = [
      `# ${p.title}`,
      `> ${p.tagline}`,
      "",
      `**AI Tool:** ${p.ai_tool_used}`,
      `**Tags:** ${p.tags.join(", ")}`,
      `**Upvotes:** ${p.upvotes}`,
      `**Submitted by:** ${p.submitter_name}`,
      p.setup_difficulty ? `**Setup Difficulty:** ${p.setup_difficulty}` : null,
      p.repo_url ? `**Repository:** ${p.repo_url}` : null,
      p.demo_url ? `**Live Demo:** ${p.demo_url}` : null,
      "",
      "## Description",
      p.description,
      p.build_story ? `\n## How It Was Built\n${p.build_story}` : null,
      p.quick_start ? `\n## Quick Start\n${p.quick_start}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "submit_project",
  "Submit a new vibecoded project to Vibrary. Use this after building something to share it with the community.",
  {
    title: z.string().describe("Project title (max 100 chars)"),
    tagline: z.string().describe("One-line description (max 200 chars)"),
    description: z.string().describe("Full project description, markdown supported (max 5000 chars)"),
    tags: z.array(z.string()).describe("Tags like 'react', 'nextjs', 'web-app' (1-5 tags). Use list_tags to see valid options."),
    ai_tool_used: z.string().describe("AI tool used to build it (e.g. 'Claude', 'Cursor', 'GPT-4'). Use list_tags to see valid options."),
    submitter_name: z.string().describe("Your name"),
    submitter_email: z.string().describe("Your email (not displayed publicly)"),
    repo_url: z.string().optional().describe("GitHub/GitLab repository URL"),
    demo_url: z.string().optional().describe("Live demo URL"),
    build_story: z.string().optional().describe("How you built it — prompts, iterations, workflow (max 3000 chars)"),
    setup_difficulty: z.enum(["trivial", "easy", "moderate", "complex"]).optional().describe("How hard is it to set up? trivial=clone and run, easy=few env vars, moderate=database/API keys, complex=multiple services"),
    quick_start: z.string().optional().describe("Step-by-step setup instructions (max 2000 chars)"),
  },
  async (params) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Submission failed: ${err.error || res.statusText}` }] };
    }

    const project = await res.json();
    const text = [
      `Project submitted successfully!`,
      ``,
      `**Title:** ${project.title}`,
      `**URL:** https://vibrary.vercel.app/project/${project.slug}`,
      `**Status:** Pending review`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "list_tags",
  "List all valid tags, AI tools, and setup difficulty levels for filtering and submitting projects on Vibrary.",
  {},
  async () => {
    const text = [
      "# Valid Vibrary Metadata",
      "",
      "## Tags (by category)",
      "",
      "**Type:** web-app, mobile-app, component, api, cli-tool, game, chrome-extension, automation, landing-page",
      "**Domain:** productivity, finance, health, education, entertainment, social, developer-tools, ai-ml, ecommerce, creative",
      "**Stack:** react, nextjs, svelte, python, node, tailwind, supabase, firebase",
      "",
      "## AI Tools",
      "Claude, GPT-4, GPT-4o, Cursor, v0, Copilot, Gemini, Replit AI, Windsurf, Bolt, Lovable, Other",
      "",
      "## Setup Difficulty Levels",
      "- **trivial** — Clone and run, no config needed",
      "- **easy** — A few env vars or simple setup",
      "- **moderate** — Database, API keys, or multi-step setup",
      "- **complex** — Significant config, multiple services",
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "list_requests",
  "Browse open project requests from the Vibrary community — things people want built. Use this to find inspiration or fulfill a community need, then use submit_project to share what you built.",
  {
    limit: z.number().optional().describe("Max results to return (default 20, max 50)"),
  },
  async (params) => {
    const url = new URL(`${API_BASE}/requests`);
    url.searchParams.set("status", "open");
    if (params.limit) url.searchParams.set("limit", String(params.limit));

    const res = await fetch(url.toString());
    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `API error: ${res.status} ${res.statusText}` }] };
    }

    const data = await res.json();
    const { requests, total } = data;

    if (!requests || requests.length === 0) {
      return { content: [{ type: "text" as const, text: "No open requests found." }] };
    }

    const lines = requests.map((r: Record<string, unknown>) =>
      [
        `## ${r.title}`,
        r.description,
        `Tags: ${(r.tags as string[]).join(", ")}`,
        `Upvotes: ${r.upvotes}`,
      ].join("\n")
    );

    const text = `${total} open request(s). Showing ${requests.length}:\n\n${lines.join("\n\n---\n\n")}`;
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "get_collections",
  "List all curated collections on Vibrary (e.g. Games, Developer Tools, Built with Claude). Use this to discover themed project sets or understand the platform's content taxonomy.",
  {},
  async () => {
    const res = await fetch(`${API_BASE}/collections`);
    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `API error: ${res.status} ${res.statusText}` }] };
    }

    const { collections } = await res.json();
    const lines = collections.map((c: Record<string, unknown>) =>
      [
        `## ${c.title}`,
        c.description,
        `Filters: ${JSON.stringify(c.query)}`,
        `Browse: ${c.url}`,
      ].join("\n")
    );

    const text = `Vibrary Collections (${collections.length}):\n\n${lines.join("\n\n---\n\n")}`;
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "upvote_project",
  "Upvote a Vibrary project by its slug to signal it is high quality or useful.",
  {
    slug: z.string().describe("The project slug to upvote (from the URL, e.g. 'my-cool-app-abc123')"),
  },
  async (params) => {
    // Fetch the project to get its UUID (upvote API requires id, not slug)
    const projectRes = await fetch(`${API_BASE}/projects/${params.slug}`);
    if (!projectRes.ok) {
      return { content: [{ type: "text" as const, text: `Project not found: ${params.slug}` }] };
    }

    const project = await projectRes.json();

    const res = await fetch(`${API_BASE}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "project", id: project.id }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Upvote failed: ${err.error || res.statusText}` }] };
    }

    const { upvotes } = await res.json();
    return { content: [{ type: "text" as const, text: `Upvoted! "${project.title}" now has ${upvotes} upvote(s).` }] };
  }
);

server.tool(
  "add_comment",
  "Post a comment on a Vibrary project. Use this to leave feedback, usage notes, or observations about a project.",
  {
    project_slug: z.string().describe("The slug of the project to comment on"),
    author_name: z.string().describe("Display name shown with the comment"),
    content: z.string().describe("The comment text (max 1000 chars)"),
    author_email: z.string().optional().describe("Contact email (not displayed publicly, used for spam prevention — defaults to agent@mcp.vibrary.app)"),
  },
  async (params) => {
    const res = await fetch(`${API_BASE}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_slug: params.project_slug,
        author_name: params.author_name,
        content: params.content,
        author_email: params.author_email ?? "agent@mcp.vibrary.app",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { content: [{ type: "text" as const, text: `Comment failed: ${err.error || res.statusText}` }] };
    }

    return { content: [{ type: "text" as const, text: `Comment posted on "${params.project_slug}" by ${params.author_name}.` }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibrary MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
