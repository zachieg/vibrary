export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { COLLECTIONS } from "@/lib/collections";
import type { Project } from "@/lib/types";
import ProjectGrid from "@/components/ProjectGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchBar from "@/components/SearchBar";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
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

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
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
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const projects = (data as Project[]).map(
    ({ submitter_email, ...rest }) => rest
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Explore", href: "/explore" },
          { label: collection.title },
        ]}
      />

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
      </div>

      <div className="mt-6">
        <Suspense>
          <SearchBar className="max-w-md" />
        </Suspense>
      </div>

      <div className="mt-6">
        <p className="mb-4 text-base text-text-secondary">
          {projects.length} project{projects.length !== 1 ? "s" : ""} found
        </p>
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
