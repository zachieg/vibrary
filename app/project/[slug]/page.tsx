export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import ProjectHero from "@/components/ProjectHero";
import ReactMarkdown from "react-markdown";

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
      images: project.screenshot_url ? [project.screenshot_url] : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-coral transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to projects
      </Link>

      {/* Header */}
      <div className="mt-6">
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
        </div>
      </div>

      {/* Hero */}
      <div className="mt-8">
        <ProjectHero
          id={project.id}
          title={project.title}
          tags={project.tags}
          screenshotUrl={project.screenshot_url}
          demoUrl={project.demo_url}
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
