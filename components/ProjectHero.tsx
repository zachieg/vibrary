import Image from "next/image";
import { getGradient, getIcon } from "@/lib/gradients";
import UpvoteButton from "./UpvoteButton";

interface ProjectHeroProps {
  id: string;
  title: string;
  tags: string[];
  screenshotUrl: string | null;
  demoUrl: string | null;
  upvotes: number;
}

export default function ProjectHero({
  id,
  title,
  tags,
  screenshotUrl,
  demoUrl,
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
          <div
            className={`flex h-[400px] w-full items-center justify-center bg-gradient-to-br ${getGradient(title)}`}
          >
            <span className="font-mono text-7xl font-bold text-white/80">{getIcon(tags)}</span>
          </div>
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
        <UpvoteButton id={id} type="project" initialCount={upvotes} />
      </div>
    </div>
  );
}
