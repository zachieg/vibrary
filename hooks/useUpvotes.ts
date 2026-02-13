"use client";

const STORAGE_KEY = "vibrary-upvotes";

function getVotes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function hasVoted(type: "project" | "request", id: string): boolean {
  return !!getVotes()[`${type}:${id}`];
}

export function markVoted(type: "project" | "request", id: string): void {
  const votes = getVotes();
  votes[`${type}:${id}`] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

export async function submitVote(
  type: "project" | "request",
  id: string
): Promise<number> {
  const res = await fetch("/api/v1/upvote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, id }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Vote failed");
  }

  const data = await res.json();
  return data.upvotes;
}
