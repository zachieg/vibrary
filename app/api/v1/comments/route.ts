export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`api-read:${ip}`, 100, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, project_slug, author_name, content, created_at")
    .eq("project_slug", slug)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`comment-ip:${ip}`, 5, 3_600_000)) {
    return NextResponse.json(
      { error: "You're commenting too fast. Please try again later." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  try {
    const body = await request.json();

    // Honeypot
    if (body.website_url_confirm) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    if (!body.project_slug?.trim()) {
      return NextResponse.json({ error: "project_slug is required" }, { status: 400 });
    }
    if (!body.author_name?.trim() || body.author_name.length > 50) {
      return NextResponse.json({ error: "Valid name required (max 50 chars)" }, { status: 400 });
    }
    if (!body.author_email?.trim() || !isValidEmail(body.author_email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!body.content?.trim() || body.content.length > 1000) {
      return NextResponse.json({ error: "Comment required (max 1000 chars)" }, { status: 400 });
    }

    if (!rateLimit(`comment-email:${body.author_email}`, 5, 3_600_000)) {
      return NextResponse.json(
        { error: "You're commenting too fast." },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        project_slug: body.project_slug.trim(),
        author_name: body.author_name.trim(),
        author_email: body.author_email.trim(),
        content: body.content.trim(),
      })
      .select("id, project_slug, author_name, content, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
