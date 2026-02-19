export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import ProjectHero from "@/components/ProjectHero";
import ReactMarkdown from "react-markdown";
import { projectJsonLd } from "@/lib/json-ld";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProjectCard from "@/components/ProjectCard";
import CommentSection from "@/components/CommentSection";
import ProjectActions from "@/components/ProjectActions";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as Project;
}

async function getRelatedProjects(projectId: string, tags: string[]) {
  if (tags.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title, tagline, tags, ai_tool_used, submitter_name, screenshot_url, created_at, upvotes, setup_difficulty")
    .eq("status", "published")
    .neq("id", projectId)
    .overlaps("tags", tags)
    .order("upvotes", { ascending: false })
    .limit(4);

  return data ?? [];
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      type: "article",
      url: `https://vibrary.vercel.app/project/${slug}`,
      images: project.screenshot_url ? [project.screenshot_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.tagline,
      images: project.screenshot_url ? [project.screenshot_url] : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const supabaseForAuth = await createClient();
  const { data: { user } } = await supabaseForAuth.auth.getUser();
  const isOwner =
    !!user?.email &&
    user.email.toLowerCase() === project.submitter_email.toLowerCase();

  const related = await getRelatedProjects(project.id, project.tags);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project)),
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: project.title },
        ]}
      />

      {/* Header */}
      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet/10 px-3 py-1 text-xs font-medium text-violet">
              Built with {project.ai_tool_used}
            </span>
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill-violet">
                {tag}
              </span>
            ))}
          </div>
          <ProjectActions slug={project.slug} isOwner={isOwner} />
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-text-primary sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-2 text-lg text-text-secondary">{project.tagline}</p>
        <div className="mt-3 flex items-center gap-3 text-sm text-text-secondary">
          <span>
            by{" "}
            {project.submitter_url ? (
              <a
                href={project.submitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-coral hover:underline"
              >
                {project.submitter_name}
              </a>
            ) : (
              <span className="font-medium">{project.submitter_name}</span>
            )}
          </span>
          <span>&middot;</span>
          <span>{timeAgo(project.created_at)}</span>
          {project.setup_difficulty && (
            <>
              <span>&middot;</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                project.setup_difficulty === "trivial" ? "bg-green-100 text-green-700" :
                project.setup_difficulty === "easy" ? "bg-blue-100 text-blue-700" :
                project.setup_difficulty === "moderate" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {project.setup_difficulty.charAt(0).toUpperCase() + project.setup_difficulty.slice(1)} setup
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="mt-8">
        <ProjectHero
          id={project.id}
          slug={project.slug}
          title={project.title}
          tags={project.tags}
          screenshotUrl={project.screenshot_url}
          demoUrl={project.demo_url}
          repoUrl={project.repo_url}
          upvotes={project.upvotes}
        />
      </div>

      {/* Description */}
      <div className="mt-8">
        <h2 className="font-serif text-xl font-bold text-text-primary">About</h2>
        <div className="prose prose-sm mt-3 max-w-none text-text-secondary prose-headings:font-serif prose-headings:text-text-primary prose-a:text-coral">
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>
      </div>

      {/* How It Was Built */}
      {project.build_story && (
        <div className="mt-8">
          <h2 className="font-serif text-xl font-bold text-text-primary">How It Was Built</h2>
          <div className="prose prose-sm mt-3 max-w-none text-text-secondary prose-headings:font-serif prose-headings:text-text-primary prose-a:text-coral">
            <ReactMarkdown>{project.build_story}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Quick Start */}
      {project.quick_start && (
        <div className="mt-8">
          <h2 className="font-serif text-xl font-bold text-text-primary">Quick Start</h2>
          <div className="prose prose-sm mt-3 max-w-none text-text-secondary prose-headings:font-serif prose-headings:text-text-primary prose-a:text-coral prose-code:text-coral">
            <ReactMarkdown>{project.quick_start}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Comments */}
      <CommentSection projectSlug={project.slug} />

      {/* Related Projects */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-serif text-xl font-bold text-text-primary">
            Related Projects
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                title={p.title}
                tagline={p.tagline}
                tags={p.tags}
                ai_tool_used={p.ai_tool_used}
                submitter_name={p.submitter_name}
                screenshot_url={p.screenshot_url}
                created_at={p.created_at}
                upvotes={p.upvotes}
                setup_difficulty={p.setup_difficulty}
              />
            ))}
          </div>
        </div>
      )}

      {/* Share + CTA */}
      <div className="mt-12 rounded-xl border border-gray-100 bg-gradient-to-br from-coral/5 to-violet/5 p-6 text-center">
        <p className="font-serif text-lg font-bold text-text-primary">
          Inspired? Share your own vibecoded project!
        </p>
        <Link
          href="/submit"
          className="mt-4 inline-flex rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md"
        >
          Submit a Project
        </Link>
      </div>
    </div>
  );
}
