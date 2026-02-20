import Link from "next/link";
import { timeAgo, truncate } from "@/lib/utils";
import SafeImage from "./SafeImage";
import GenerativePattern from "./GenerativePattern";
import UpvoteButton from "./UpvoteButton";

interface ProjectCardProps {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  tags: string[];
  ai_tool_used: string;
  submitter_name: string;
  screenshot_url: string | null;
  created_at: string;
  upvotes: number;
  featured?: boolean;
  setup_difficulty?: string | null;
}

export default function ProjectCard({
  id,
  slug,
  title,
  tagline,
  tags,
  ai_tool_used,
  submitter_name,
  screenshot_url,
  created_at,
  upvotes,
  featured,
  setup_difficulty,
}: ProjectCardProps) {
  return (
    <Link href={`/project/${slug}`} className="group block">
      <article className="card-hover overflow-hidden rounded-xl border border-gray-100 bg-surface shadow-sm">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {screenshot_url ? (
            <SafeImage
              src={screenshot_url}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fallbackSeed={slug}
              fallbackTags={tags}
              fallbackClassName="h-full w-full"
            />
          ) : (
            <GenerativePattern seed={slug} tags={tags} className="h-full w-full" />
          )}
          {/* AI tool badge */}
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-violet shadow-sm backdrop-blur-sm">
            {ai_tool_used}
          </span>
          {/* Featured badge */}
          {featured && (
            <span className="absolute left-2 top-2 rounded-full bg-amber/90 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-serif text-xl font-bold leading-tight text-text-primary group-hover:text-coral transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="mt-1 text-base leading-relaxed text-text-secondary line-clamp-2">
            {truncate(tagline, 120)}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill-violet">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <span>{submitter_name}</span>
              {setup_difficulty && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  setup_difficulty === "trivial" ? "bg-green-100 text-green-700" :
                  setup_difficulty === "easy" ? "bg-blue-100 text-blue-700" :
                  setup_difficulty === "moderate" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {setup_difficulty.charAt(0).toUpperCase() + setup_difficulty.slice(1)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UpvoteButton id={id} type="project" initialCount={upvotes} />
              <span>{timeAgo(created_at)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
