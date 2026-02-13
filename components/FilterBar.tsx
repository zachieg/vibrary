"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ALL_TAGS, AI_TOOLS } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const activeAiTool = searchParams.get("ai_tool") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("offset");
    router.push(`/?${params.toString()}`);
  }

  function toggleTag(tag: string) {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    updateParams("tags", next.join(","));
  }

  return (
    <div className="space-y-3">
      {/* Sort + AI Tool */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-text-primary focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={activeAiTool}
          onChange={(e) => updateParams("ai_tool", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-text-primary focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        >
          <option value="">All AI Tools</option>
          {AI_TOOLS.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>

        {(activeTags.length > 0 || activeAiTool) && (
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("tags");
              params.delete("ai_tool");
              params.delete("offset");
              router.push(`/?${params.toString()}`);
            }}
            className="text-sm text-coral hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTags.includes(tag)
                ? "bg-violet text-white"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
