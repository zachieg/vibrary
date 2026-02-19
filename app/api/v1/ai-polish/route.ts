export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`ai-polish:${ip}`, 5, 3_600_000)) {
    return NextResponse.json(
      { error: "AI polish limit reached. You can try again in an hour." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI polish is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { description, tagline } = body as {
      description?: string;
      tagline?: string;
    };

    if (!description?.trim() || description.trim().length < 100) {
      return NextResponse.json(
        { error: "Description must be at least 100 characters to polish." },
        { status: 400 }
      );
    }

    const descriptionInput = description.trim().substring(0, 3000);
    const taglineInput = (tagline ?? "").trim().substring(0, 200);

    const prompt = `You are a helpful assistant that improves project descriptions for a developer showcase site called Vibrary, which features projects built with AI tools.

Here is the current project content:

<tagline>${taglineInput || "(none provided)"}</tagline>

<description>
${descriptionInput}
</description>

Please produce two improved outputs:

1. A punchy, present-tense tagline (max 200 characters). Focus on what the project does or the benefit it provides. Do not start with "A " or "An ".

2. An improved description (max 2000 characters). Clean up any README-style content: remove CI badge references, strip raw markdown clutter, fix formatting, and make it scannable with short paragraphs. Keep the core information but make it engaging for a developer browsing a gallery.

Respond ONLY with a valid JSON object in this exact shape, no extra text:
{"tagline": "...", "description": "..."}`;

    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("Anthropic API error:", res.status);
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawText = data?.content?.[0]?.text ?? "";

    let parsed: { tagline?: string; description?: string };
    try {
      const cleaned = rawText.replace(/^```[a-z]*\n?/gm, "").replace(/```$/gm, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawText);
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    const polishedTagline = (parsed.tagline ?? "").trim().substring(0, 200);
    const polishedDescription = (parsed.description ?? "").trim().substring(0, 5000);

    if (!polishedTagline && !polishedDescription) {
      return NextResponse.json(
        { error: "AI did not return usable content. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      tagline: polishedTagline,
      description: polishedDescription,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
