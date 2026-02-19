export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { ProjectRequest } from "@/lib/types";
import RequestsClient from "@/components/RequestsClient";

export const metadata: Metadata = {
  title: "Project Requests",
  description:
    "Request vibecoded projects you'd like to see built by the community.",
};

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_requests")
    .select(
      "id, title, description, tags, requester_name, status, fulfilled_by, upvotes, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const requests = (data ?? []) as Omit<ProjectRequest, "requester_email">[];

  return (
    <RequestsClient initialRequests={requests} />
  );
}
