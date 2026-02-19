"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const authorized = isAdmin(user?.email);

  useEffect(() => {
    if (authLoading || !authorized) return;

    async function fetchProjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      setProjects((data as Project[]) ?? []);
      setLoading(false);
    }

    fetchProjects();
  }, [authLoading, authorized]);

  async function toggleFeatured(id: string, currentValue: boolean) {
    setTogglingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ featured: !currentValue })
      .eq("id", id);

    if (!error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: !currentValue } : p))
      );
    }
    setTogglingId(null);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-text-secondary">Not authorized</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
      <h1 className="font-serif text-3xl font-bold text-text-primary">
        Admin — Manage Projects
      </h1>
      <p className="mt-2 text-text-secondary">
        Toggle which projects appear in the Editor&apos;s Picks carousel on the home page.
      </p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
        </div>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-text-secondary">No published projects yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-text-secondary">
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">AI Tool</th>
                <th className="pb-3 pr-4 font-medium text-center">Upvotes</th>
                <th className="pb-3 font-medium text-center">Featured</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <td className="py-3 pr-4">
                    <a
                      href={`/project/${project.slug}`}
                      className="font-medium text-text-primary hover:text-coral transition-colors"
                    >
                      {project.title}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {project.ai_tool_used}
                  </td>
                  <td className="py-3 pr-4 text-center text-text-secondary">
                    {project.upvotes}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() =>
                        toggleFeatured(project.id, project.featured)
                      }
                      disabled={togglingId === project.id}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        project.featured
                          ? "bg-amber/15 text-amber hover:bg-amber/25"
                          : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                      } ${togglingId === project.id ? "opacity-50" : ""}`}
                    >
                      {project.featured ? (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          Featured
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                          </svg>
                          Not Featured
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
