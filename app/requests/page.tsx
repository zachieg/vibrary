export const dynamic = "force-dynamic";

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { ProjectRequest } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import RequestsClient from "@/components/RequestsClient";

export const metadata: Metadata = {
  title: "Project Requests",
  description:
    "Request vibecoded projects you'd like to see built by the community.",
};

interface RequestsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("project_requests")
    .select(
      "id, title, description, tags, requester_name, status, fulfilled_by, upvotes, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  const { data } = await query;

  const requests = (data ?? []) as Omit<ProjectRequest, "requester_email">[];

  return (
    <RequestsClient initialRequests={requests} searchQuery={q}>
      <Suspense>
        <SearchBar className="max-w-md mx-auto" />
      </Suspense>
    </RequestsClient>
  );
}
