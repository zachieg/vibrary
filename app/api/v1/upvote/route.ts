export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`upvote:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Too many votes. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const { type, id } = await request.json();

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id are required" },
        { status: 400 }
      );
    }

    if (type !== "project" && type !== "request") {
      return NextResponse.json(
        { error: "type must be 'project' or 'request'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const table = type === "project" ? "projects" : "project_requests";

    // Read current upvotes then increment
    const { data: current, error: readError } = await supabase
      .from(table)
      .select("upvotes")
      .eq("id", id)
      .single();

    if (readError || !current) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const newCount = (current.upvotes ?? 0) + 1;

    const { error: updateError } = await supabase
      .from(table)
      .update({ upvotes: newCount })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ upvotes: newCount });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
