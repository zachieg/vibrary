export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.16.") ||
      host.startsWith("172.17.") ||
      host.startsWith("172.18.") ||
      host.startsWith("172.19.") ||
      host.startsWith("172.2") ||
      host.startsWith("172.30.") ||
      host.startsWith("172.31.") ||
      host.endsWith(".local") ||
      host === "metadata.google.internal" ||
      host === "169.254.169.254"
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function extractMeta(html: string): {
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
} {
  function getMetaContent(property: string): string | null {
    // property=... content=...
    const m1 = html.match(
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
    );
    if (m1) return m1[1].trim();
    // content=... property=...
    const m2 = html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")
    );
    return m2 ? m2[1].trim() : null;
  }

  return {
    ogImage: getMetaContent("og:image") ?? getMetaContent("twitter:image"),
    ogTitle: getMetaContent("og:title"),
    ogDescription: getMetaContent("og:description"),
  };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`fetch-meta:${ip}`, 30, 600_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const empty = { ogImage: null, ogTitle: null, ogDescription: null };

  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    if (isBlockedUrl(url)) {
      return NextResponse.json({ error: "Invalid or disallowed URL" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let html = "";
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Vibrary-Bot/1.0 (OG metadata fetch)",
          Accept: "text/html",
        },
      });
      clearTimeout(timeout);

      if (!res.ok) return NextResponse.json(empty);

      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let bytesRead = 0;
        const maxBytes = 65536;

        while (bytesRead < maxBytes) {
          const { done, value } = await reader.read();
          if (done) break;
          html += decoder.decode(value, { stream: true });
          bytesRead += value.byteLength;
          if (html.includes("</head>")) break;
        }
        reader.cancel();
      }
    } catch {
      clearTimeout(timeout);
      return NextResponse.json(empty);
    }

    const meta = extractMeta(html);

    // Resolve relative og:image URLs to absolute
    if (meta.ogImage && !meta.ogImage.startsWith("http://") && !meta.ogImage.startsWith("https://")) {
      try {
        meta.ogImage = new URL(meta.ogImage, new URL(url).origin).toString();
      } catch {
        meta.ogImage = null;
      }
    }

    return NextResponse.json(meta);
  } catch {
    return NextResponse.json(empty);
  }
}
