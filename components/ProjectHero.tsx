import Image from "next/image";
import GenerativePattern from "./GenerativePattern";
import UpvoteButton from "./UpvoteButton";
import ShareButtons from "./ShareButtons";

interface ProjectHeroProps {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  screenshotUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  upvotes: number;
}

export default function ProjectHero({
  id,
  slug,
  title,
  tags,
  screenshotUrl,
  demoUrl,
  repoUrl,
  upvotes,
}: ProjectHeroProps) {
  return (
    <div className="space-y-4">
      {/* Hero image / gradient fallback */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200">
        {screenshotUrl ? (
          <div className="relative" style={{ maxHeight: "500px" }}>
            <Image
              src={screenshotUrl}
              alt={`${title} screenshot`}
              width={1200}
              height={675}
              className="w-full object-cover"
              style={{ maxHeight: "500px" }}
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
            />
          </div>
        ) : (
          <GenerativePattern seed={slug} tags={tags} className="h-[400px] w-full" />
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3">
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md"
          >
            Try Live Demo
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
          >
            View Source
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        )}
        <UpvoteButton id={id} type="project" initialCount={upvotes} />
        <div className="ml-auto">
          <ShareButtons title={title} url={`https://vibrary.vercel.app/project/${slug}`} />
        </div>
      </div>
    </div>
  );
}
