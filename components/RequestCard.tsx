import { timeAgo } from "@/lib/utils";
import UpvoteButton from "./UpvoteButton";

interface RequestCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  requester_name: string;
  created_at: string;
  status: string;
  upvotes: number;
}

export default function RequestCard({
  id,
  title,
  description,
  tags,
  requester_name,
  created_at,
  status,
  upvotes,
}: RequestCardProps) {
  return (
    <article className="card-hover rounded-xl border border-gray-100 bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl">💡</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-text-primary line-clamp-1">
              {title}
            </h3>
            {status === "fulfilled" && (
              <span className="tag-pill bg-emerald-100 text-emerald-700">
                Fulfilled
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-3">
            {description}
          </p>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="tag-pill-amber">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
            <span>Requested by {requester_name}</span>
            <div className="flex items-center gap-2">
              <UpvoteButton id={id} type="request" initialCount={upvotes} />
              <span>{timeAgo(created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
