export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUrl } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import type { Project } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { submitter_email, ...project } = data as Project;
  return NextResponse.json(project);
}

async function verifyOwnership(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return { error: "Authentication required", status: 401, supabase, project: null };
  }

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (fetchError || !project) {
    return { error: "Project not found", status: 404, supabase, project: null };
  }

  if ((project as Project).submitter_email.toLowerCase() !== user.email.toLowerCase()) {
    return { error: "You can only edit your own projects", status: 403, supabase, project: null };
  }

  return { error: null, status: 200, supabase, project: project as Project };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`project-edit:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const { error, status, supabase, project } = await verifyOwnership(slug);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    const allowed = [
      "title", "tagline", "description", "demo_url", "repo_url",
      "build_story", "setup_difficulty", "quick_start", "tags", "ai_tool_used",
    ];
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    // Basic validation
    if (updates.title !== undefined) {
      if (!String(updates.title).trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
      if (String(updates.title).length > 100) return NextResponse.json({ error: "Title max 100 chars" }, { status: 400 });
    }
    if (updates.tagline !== undefined && String(updates.tagline).length > 200) {
      return NextResponse.json({ error: "Tagline max 200 chars" }, { status: 400 });
    }
    if (updates.description !== undefined && String(updates.description).length > 5000) {
      return NextResponse.json({ error: "Description max 5000 chars" }, { status: 400 });
    }
    if (updates.demo_url && !isValidUrl(String(updates.demo_url))) {
      return NextResponse.json({ error: "Invalid demo URL" }, { status: 400 });
    }
    if (updates.repo_url && !isValidUrl(String(updates.repo_url))) {
      return NextResponse.json({ error: "Invalid repo URL" }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", project!.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { submitter_email, ...result } = data as Project;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { error, status, supabase, project } = await verifyOwnership(slug);
  if (error) return NextResponse.json({ error }, { status });

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", project!.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
