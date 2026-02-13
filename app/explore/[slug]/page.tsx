export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { COLLECTIONS } from "@/lib/collections";
import type { Project } from "@/lib/types";
import ProjectGrid from "@/components/ProjectGrid";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.title,
    description: collection.description,
    openGraph: {
      title: `${collection.title} | Vibrary`,
      description: collection.description,
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  if (collection.query.tags && collection.query.tags.length > 0) {
    query = query.overlaps("tags", collection.query.tags);
  }
  if (collection.query.ai_tool) {
    query = query.ilike("ai_tool_used", collection.query.ai_tool);
  }

  const { data, error } = await query;
  if (error) throw error;

  const projects = (data as Project[]).map(
    ({ submitter_email, ...rest }) => rest
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-coral transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Explore
      </Link>

      <div className="mt-6">
        <div
          className={`inline-block rounded-xl bg-gradient-to-br ${collection.gradient} px-4 py-2`}
        >
          <h1 className="font-serif text-4xl font-bold text-white">
            {collection.title}
          </h1>
        </div>
        <p className="mt-3 text-xl text-text-secondary">
          {collection.description}
        </p>
        <p className="mt-1 text-base text-text-secondary">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-8">
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
