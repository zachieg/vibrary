"use client";

import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  projectSlug: string;
}

export default function CommentSection({ projectSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [hp, setHp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/v1/comments?slug=${encodeURIComponent(projectSlug)}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/v1/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_slug: projectSlug,
        author_name: name.trim(),
        author_email: email.trim(),
        content: content.trim(),
      }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setContent("");
      setShowForm(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post comment.");
    }

    setSubmitting(false);
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-text-primary">
          Comments{comments.length > 0 ? ` (${comments.length})` : ""}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium text-coral hover:underline"
        >
          {showForm ? "Cancel" : "Add Comment"}
        </button>
      </div>

      {/* Comment form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-surface p-4"
        >
          {/* Honeypot */}
          <input
            type="text"
            name="company"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name *"
              maxLength={50}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email * (not displayed)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Leave a comment..."
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {content.length}/1000
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-gray-100 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {c.author_name}
                </span>
                <span className="text-xs text-text-secondary">
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-text-secondary">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
