export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { COLLECTIONS } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Explore Vibecoded Projects",
  description:
    "Browse curated collections of vibecoded projects — games, developer tools, creative experiments, and more.",
  openGraph: {
    title: "Explore Vibecoded Projects | Vibrary",
    description:
      "Browse curated collections of vibecoded projects — games, developer tools, creative experiments, and more.",
  },
};

async function getCollectionCounts() {
  const supabase = await createClient();
  const counts: Record<string, number> = {};

  await Promise.all(
    COLLECTIONS.map(async (col) => {
      let query = supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      if (col.query.tags && col.query.tags.length > 0) {
        query = query.overlaps("tags", col.query.tags);
      }
      if (col.query.ai_tool) {
        query = query.ilike("ai_tool_used", col.query.ai_tool);
      }

      const { count } = await query;
      counts[col.slug] = count ?? 0;
    })
  );

  return counts;
}

export default async function ExplorePage() {
  const counts = await getCollectionCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-5xl font-bold text-text-primary">
          Explore
        </h1>
        <p className="mt-3 text-xl text-text-secondary">
          Curated collections of vibecoded projects
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {COLLECTIONS.map((col) => (
          <Link
            key={col.slug}
            href={`/explore/${col.slug}`}
            className="group block"
          >
            <div
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${col.gradient} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
              style={{ minHeight: "180px" }}
            >
              <h2 className="font-serif text-3xl font-bold text-white">
                {col.title}
              </h2>
              <p className="mt-2 text-base text-white/80">{col.description}</p>
              <p className="mt-4 text-sm font-medium text-white/60">
                {counts[col.slug]} project{counts[col.slug] !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
