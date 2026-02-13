export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import type { ProjectRequest } from "@/lib/types";

const RATE_LIMIT_EXCEEDED = NextResponse.json(
  { error: "You're submitting too fast. Please try again later." },
  { status: 429, headers: { "Retry-After": "60" } }
);

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`api-read:${ip}`, 100, 60_000)) {
    return RATE_LIMIT_EXCEEDED;
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const supabase = await createClient();
  let query = supabase
    .from("project_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const requests = (data as ProjectRequest[]).map(
    ({ requester_email, ...rest }) => rest
  );

  return NextResponse.json({
    requests,
    total: count ?? 0,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  // IP rate limit: 10 requests per hour
  if (!rateLimit(`request-submit-ip:${ip}`, 10, 3_600_000)) {
    return RATE_LIMIT_EXCEEDED;
  }

  const supabase = await createClient();

  try {
    const body = await request.json();

    // Honeypot check
    if (body.website_url_confirm) {
      return NextResponse.json({ error: "Submission rejected" }, { status: 400 });
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (body.title.length > 100) {
      return NextResponse.json({ error: "Title max 100 characters" }, { status: 400 });
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (body.description.length > 1000) {
      return NextResponse.json({ error: "Description max 1000 characters" }, { status: 400 });
    }
    if (!body.requester_name?.trim()) {
      return NextResponse.json({ error: "requester_name is required" }, { status: 400 });
    }
    if (!body.requester_email?.trim() || !isValidEmail(body.requester_email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Per-email rate limit: 5 requests per day
    if (!rateLimit(`request-submit-email:${body.requester_email}`, 5, 86_400_000)) {
      return RATE_LIMIT_EXCEEDED;
    }

    const tags = Array.isArray(body.tags) ? body.tags.slice(0, 3) : [];

    const { data, error } = await supabase
      .from("project_requests")
      .insert({
        title: body.title.trim(),
        description: body.description.trim(),
        tags,
        requester_name: body.requester_name.trim(),
        requester_email: body.requester_email.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { requester_email, ...result } = data as ProjectRequest;
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
