import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/collections";

export async function GET() {
  const collections = COLLECTIONS.map(({ slug, title, description, query }) => ({
    slug,
    title,
    description,
    query,
    url: `https://vibrary.vercel.app/explore/${slug}`,
  }));
  return NextResponse.json({ collections });
}
