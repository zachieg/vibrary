import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";

type ProjectPublic = Omit<Project, "submitter_email">;

export default function ProjectGrid({
  projects,
}: {
  projects: ProjectPublic[];
}) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="h-12 w-12 text-text-secondary/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <h3 className="mt-4 font-serif text-xl font-bold text-text-primary">
          No projects found
        </h3>
        <p className="mt-2 text-text-secondary">
          Be the first to submit one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
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
          setup_difficulty={project.setup_difficulty}
        />
      ))}
    </div>
  );
}
