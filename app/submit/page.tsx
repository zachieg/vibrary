import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Project",
  description: "Share your vibecoded project with the community.",
};

interface SubmitPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const { edit } = await searchParams;

  let editData: {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    demo_url: string | null;
    repo_url: string | null;
    build_story: string | null;
    setup_difficulty: string | null;
    quick_start: string | null;
    screenshot_url: string | null;
    tags: string[];
    ai_tool_used: string;
  } | null = null;

  if (edit) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      const { data } = await supabase
        .from("projects")
        .select(
          "slug, title, tagline, description, demo_url, repo_url, build_story, setup_difficulty, quick_start, screenshot_url, tags, ai_tool_used, submitter_email"
        )
        .eq("slug", edit);

      if (data?.[0] && data[0].submitter_email.toLowerCase() === user.email.toLowerCase()) {
        const { submitter_email: _e, ...rest } = data[0];
        editData = rest;
      }
    }
  }

  const isEditMode = !!editData;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-text-primary">
          {isEditMode ? `Edit: ${editData!.title}` : "Submit Your Project"}
        </h1>
        <p className="mt-2 text-text-secondary">
          {isEditMode
            ? "Update your project details below."
            : "Share what you\u2019ve vibecoded with the community. No account needed."}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-gray-100 bg-surface p-6 shadow-sm sm:p-8">
        {isEditMode && !editData ? (
          <p className="text-center text-text-secondary">
            Project not found or you don&apos;t have permission to edit it.
          </p>
        ) : (
          <SubmitForm
            editSlug={editData?.slug}
            initialData={editData ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
