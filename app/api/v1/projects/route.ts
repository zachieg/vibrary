export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueSlug, isValidEmail, isValidUrl, truncate } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import type { Project } from "@/lib/types";

const RATE_LIMIT_EXCEEDED = NextResponse.json(
  { error: "You're submitting too fast. Please try again later." },
  { status: 429, headers: { "Retry-After": "60" } }
);

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`api-read:${ip}`, 100, 60_000)) {
    return RATE_LIMIT_EXCEEDED;
  }

  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const tags = searchParams.get("tags");
  const aiTool = searchParams.get("ai_tool");
  const setupDifficulty = searchParams.get("setup_difficulty");
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort") ?? "newest";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  let query = supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (featured === "true") {
    query = query.eq("featured", true);
  }

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  if (tags) {
    const tagList = tags.split(",").filter(Boolean);
    if (tagList.length > 0) {
      query = query.overlaps("tags", tagList);
    }
  }

  if (aiTool) {
    query = query.ilike("ai_tool_used", aiTool);
  }

  if (setupDifficulty) {
    query = query.eq("setup_difficulty", setupDifficulty);
  }

  if (sort === "popular") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const projects = (data as Project[]).map(({ submitter_email, ...rest }) => ({
    ...rest,
    description: truncate(rest.description, 300),
  }));

  return NextResponse.json({
    projects,
    total: count ?? 0,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  // IP rate limit: 10 submissions per hour
  if (!rateLimit(`project-submit-ip:${ip}`, 10, 3_600_000)) {
    return RATE_LIMIT_EXCEEDED;
  }

  const supabase = await createClient();

  try {
    const body = await request.json();

    // Honeypot check
    if (body.website_url_confirm) {
      return NextResponse.json({ error: "Submission rejected" }, { status: 400 });
    }

    // Validate required fields
    const required = ["title", "tagline", "description", "ai_tool_used", "submitter_name", "submitter_email"];
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Per-email rate limit: 5 submissions per day
    if (!rateLimit(`project-submit-email:${body.submitter_email}`, 5, 86_400_000)) {
      return RATE_LIMIT_EXCEEDED;
    }

    if (body.title.length > 100) {
      return NextResponse.json({ error: "Title max 100 characters" }, { status: 400 });
    }
    if (body.tagline.length > 200) {
      return NextResponse.json({ error: "Tagline max 200 characters" }, { status: 400 });
    }
    if (body.description.length > 5000) {
      return NextResponse.json({ error: "Description max 5000 characters" }, { status: 400 });
    }
    if (!isValidEmail(body.submitter_email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (body.demo_url && !isValidUrl(body.demo_url)) {
      return NextResponse.json({ error: "Invalid demo URL" }, { status: 400 });
    }
    if (body.repo_url && !isValidUrl(body.repo_url)) {
      return NextResponse.json({ error: "Invalid repository URL" }, { status: 400 });
    }
    if (body.build_story && body.build_story.length > 3000) {
      return NextResponse.json({ error: "Build story max 3000 characters" }, { status: 400 });
    }
    if (body.setup_difficulty && !["trivial", "easy", "moderate", "complex"].includes(body.setup_difficulty)) {
      return NextResponse.json({ error: "Invalid setup difficulty" }, { status: 400 });
    }
    if (body.quick_start && body.quick_start.length > 2000) {
      return NextResponse.json({ error: "Quick start max 2000 characters" }, { status: 400 });
    }

    const tags = Array.isArray(body.tags) ? body.tags.slice(0, 5) : [];
    const slug = generateUniqueSlug(body.title);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: body.title.trim(),
        slug,
        tagline: body.tagline.trim(),
        description: body.description.trim(),
        demo_url: body.demo_url?.trim() || null,
        repo_url: body.repo_url?.trim() || null,
        build_story: body.build_story?.trim() || null,
        setup_difficulty: body.setup_difficulty || null,
        quick_start: body.quick_start?.trim() || null,
        screenshot_url: body.screenshot_url?.trim() || null,
        tags,
        ai_tool_used: body.ai_tool_used.trim(),
        submitter_name: body.submitter_name.trim(),
        submitter_email: body.submitter_email.trim(),
        submitter_url: body.submitter_url?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { submitter_email, ...project } = data as Project;
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
