import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { COLLECTIONS } from "@/lib/collections";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = "https://vibrary.vercel.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/requests`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map((col) => ({
    url: `${baseUrl}/explore/${col.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const { data: projects } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const projectPages: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `${baseUrl}/project/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...collectionPages, ...projectPages];
}
