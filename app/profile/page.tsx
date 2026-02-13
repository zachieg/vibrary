"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import ProjectGrid from "@/components/ProjectGrid";
import type { Project } from "@/lib/types";

type ProjectPublic = Omit<Project, "submitter_email">;

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<ProjectPublic[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchUserProjects() {
      setLoadingProjects(true);
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("submitter_email", user!.email)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (data) {
        setProjects(
          (data as Project[]).map(({ submitter_email, ...rest }) => rest)
        );
      }
      setLoadingProjects(false);
    }

    fetchUserProjects();
  }, [user, supabase]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.user_name ||
    user.email?.split("@")[0] ||
    "User";
  const githubUsername = user.user_metadata?.user_name;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Profile header */}
      <div className="flex items-center gap-5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-coral/10 text-3xl font-bold text-coral">
            {displayName[0].toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            {displayName}
          </h1>
          {user.email && (
            <p className="text-sm text-text-secondary">{user.email}</p>
          )}
          {githubUsername && (
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-coral hover:underline"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              @{githubUsername}
            </a>
          )}
          {user.user_metadata?.bio && (
            <p className="mt-2 text-sm text-text-secondary">
              {user.user_metadata.bio}
            </p>
          )}
          {user.user_metadata?.website && (
            <a
              href={user.user_metadata.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-violet hover:underline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
              </svg>
              {user.user_metadata.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/settings"
          className="rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral/90"
        >
          Edit Profile
        </Link>
        <button
          onClick={signOut}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50 hover:text-text-primary"
        >
          Sign Out
        </button>
      </div>

      {/* User's projects */}
      <div className="mt-10">
        <h2 className="font-serif text-xl font-bold text-text-primary">
          Your Projects
        </h2>
        {loadingProjects ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/50 p-8 text-center">
            <svg className="mx-auto h-10 w-10 text-text-secondary/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <p className="mt-3 text-text-secondary">
              No projects submitted yet. Share your first vibecoded project!
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <ProjectGrid projects={projects} />
          </div>
        )}
      </div>
    </div>
  );
}
