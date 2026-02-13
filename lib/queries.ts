import { createClient } from "./supabase/server";
import type { Project, ProjectInsert, ProjectRequest, ProjectRequestInsert } from "./types";

interface ListProjectsParams {
  q?: string;
  tags?: string[];
  ai_tool?: string;
  sort?: "newest" | "popular";
  limit?: number;
  offset?: number;
}

export async function listProjects({
  q,
  tags,
  ai_tool,
  sort = "newest",
  limit = 20,
  offset = 0,
}: ListProjectsParams = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (q) {
    query = query.textSearch("title || ' ' || tagline || ' ' || description", q, {
      type: "websearch",
      config: "english",
    });
  }

  if (tags && tags.length > 0) {
    query = query.overlaps("tags", tags);
  }

  if (ai_tool) {
    query = query.ilike("ai_tool_used", ai_tool);
  }

  if (sort === "popular") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    projects: (data as Project[]).map(({ submitter_email, ...rest }) => rest),
    total: count ?? 0,
    limit,
    offset,
  };
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;

  const { submitter_email, ...project } = data as Project;
  return project;
}

export async function createProject(project: ProjectInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) throw error;

  const { submitter_email, ...result } = data as Project;
  return result;
}

export async function listRequests({
  status,
  limit = 20,
  offset = 0,
}: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("project_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    requests: (data as ProjectRequest[]).map(({ requester_email, ...rest }) => rest),
    total: count ?? 0,
    limit,
    offset,
  };
}

export async function createRequest(request: ProjectRequestInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_requests")
    .insert(request)
    .select()
    .single();

  if (error) throw error;

  const { requester_email, ...result } = data as ProjectRequest;
  return result;
}

export async function uploadScreenshot(file: File, projectId: string): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "png";
  const filename = `${projectId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("project-screenshots")
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("project-screenshots")
    .getPublicUrl(filename);

  return data.publicUrl;
}
