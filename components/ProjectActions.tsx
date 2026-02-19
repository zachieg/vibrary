"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectActionsProps {
  slug: string;
  isOwner: boolean;
}

export default function ProjectActions({ slug, isOwner }: ProjectActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOwner) return null;

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/v1/projects/${slug}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete project.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <a
        href={`/submit?edit=${slug}`}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50"
      >
        Edit
      </a>

      {showConfirm ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-600">Delete this project?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}
