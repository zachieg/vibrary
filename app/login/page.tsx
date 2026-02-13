"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { user, loading, signInWithGitHub, signInWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authError = searchParams.get("error");

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError("");

    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <svg className="mx-auto h-12 w-12 text-coral" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        <h1 className="mt-4 font-serif text-2xl font-bold text-text-primary">
          Check your email
        </h1>
        <p className="mt-2 text-text-secondary">
          We sent a magic link to <strong>{email}</strong>. Click the link to
          sign in.
        </p>
        <button
          onClick={() => setEmailSent(false)}
          className="mt-6 text-sm text-coral hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-text-primary">
          Sign in to Vibrary
        </h1>
        <p className="mt-2 text-text-secondary">
          Submit projects, upvote your favorites, and build your profile.
        </p>
      </div>

      {(error || authError) && (
        <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error || "Authentication failed. Please try again."}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {/* GitHub OAuth */}
        <button
          onClick={signInWithGitHub}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24292f]/90"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-text-secondary">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Magic Link */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all hover:bg-gray-50 disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
