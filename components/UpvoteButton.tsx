"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { hasVoted as hasVotedLocal, markVoted as markVotedLocal, submitVote } from "@/hooks/useUpvotes";

interface UpvoteButtonProps {
  id: string;
  type: "project" | "request";
  initialCount: number;
}

export default function UpvoteButton({ id, type, initialCount }: UpvoteButtonProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Check Supabase for auth-backed votes
      const supabase = createClient();
      supabase
        .from("user_upvotes")
        .select("id")
        .eq("user_id", user.id)
        .eq("target_type", type)
        .eq("target_id", id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setVoted(true);
        });
    } else {
      // Fall back to localStorage for anonymous users
      setVoted(hasVotedLocal(type, id));
    }
  }, [type, id, user]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (voted || loading) return;

    setLoading(true);
    setCount((c) => c + 1);
    setVoted(true);

    try {
      const newCount = await submitVote(type, id);
      setCount(newCount);

      if (user) {
        // Record in Supabase
        const supabase = createClient();
        await supabase.from("user_upvotes").insert({
          user_id: user.id,
          target_type: type,
          target_id: id,
        });
      } else {
        // Fall back to localStorage
        markVotedLocal(type, id);
      }
    } catch {
      setCount(initialCount);
      setVoted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={voted || loading}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
        voted
          ? "text-coral"
          : "text-text-secondary hover:text-coral hover:bg-coral/5"
      } disabled:cursor-default`}
      title={voted ? "You've upvoted this" : "Upvote"}
    >
      <svg
        className="h-4 w-4"
        fill={voted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
