export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectCard from "@/components/ProjectCard";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    tags?: string;
    ai_tool?: string;
    setup_difficulty?: string;
    sort?: string;
    offset?: string;
  }>;
}

async function fetchFeaturedProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) return [];
  return (data as Project[]).map(({ submitter_email, ...rest }) => rest);
}

async function fetchProjects(params: {
  q?: string;
  tags?: string;
  ai_tool?: string;
  setup_difficulty?: string;
  sort?: string;
  offset?: string;
}) {
  const supabase = await createClient();
  const limit = 25;
  const offset = parseInt(params.offset ?? "0", 10);

  let query = supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,tagline.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }

  if (params.tags) {
    const tags = params.tags.split(",").filter(Boolean);
    if (tags.length > 0) {
      query = query.overlaps("tags", tags);
    }
  }

  if (params.ai_tool) {
    query = query.ilike("ai_tool_used", params.ai_tool);
  }

  if (params.setup_difficulty) {
    query = query.eq("setup_difficulty", params.setup_difficulty);
  }

  if (params.sort === "popular") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const projects = (data as Project[]).map(
    ({ submitter_email, ...rest }) => rest
  );

  return { projects, total: count ?? 0, limit, offset };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [{ projects, total, limit, offset }, featuredProjects] =
    await Promise.all([fetchProjects(params), fetchFeaturedProjects()]);

  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;
  const isFiltering = params.q || params.tags || params.ai_tool || params.setup_difficulty;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-coral/10 via-violet/5 to-amber/10 py-14">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8 lg:px-12">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            The open library for
            <span className="bg-gradient-to-r from-coral to-violet bg-clip-text text-transparent">
              {" "}vibecoded{" "}
            </span>
            projects
          </h1>
          <p className="mt-5 text-xl text-text-secondary">
            Discover, share, and clone community creations built with AI.
            Every vibecoded project becomes a building block for the next.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/submit"
              className="inline-flex rounded-xl bg-coral px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md"
            >
              Submit a Project
            </Link>
            <Link
              href="/requests"
              className="inline-flex rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-text-primary shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              Request a Project
            </Link>
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      {featuredProjects.length > 0 && !isFiltering && (
        <section className="mx-auto max-w-7xl px-6 pt-10 sm:px-8 lg:px-12">
          <h2 className="font-serif text-3xl font-bold text-text-primary">
            Editor&apos;s Picks
          </h2>
          <div className="mt-4 flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {featuredProjects.map((project) => (
              <div key={project.id} className="w-[320px] flex-shrink-0">
                <ProjectCard
                  id={project.id}
                  slug={project.slug}
                  title={project.title}
                  tagline={project.tagline}
                  tags={project.tags}
                  ai_tool_used={project.ai_tool_used}
                  submitter_name={project.submitter_name}
                  screenshot_url={project.screenshot_url}
                  created_at={project.created_at}
                  upvotes={project.upvotes}
                  featured
                  setup_difficulty={project.setup_difficulty}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search + Filters + Grid */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        <Suspense>
          <SearchBar className="mx-auto max-w-3xl" />
          <div className="mt-6">
            <FilterBar />
          </div>
        </Suspense>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base text-text-secondary">
              {total} project{total !== 1 ? "s" : ""} found
            </p>
          </div>
          <ProjectGrid projects={projects} />

          {/* Pagination */}
          {(hasPrev || hasMore) && (
            <div className="mt-8 flex justify-center gap-3">
              {hasPrev && (
                <Link
                  href={`/?${new URLSearchParams({
                    ...params,
                    offset: String(Math.max(0, offset - limit)),
                  }).toString()}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-gray-50"
                >
                  &larr; Previous
                </Link>
              )}
              {hasMore && (
                <Link
                  href={`/?${new URLSearchParams({
                    ...params,
                    offset: String(offset + limit),
                  }).toString()}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-gray-50"
                >
                  Next &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
