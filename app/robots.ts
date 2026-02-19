import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/settings/", "/login/"],
      },
    ],
    sitemap: "https://vibrary.vercel.app/sitemap.xml",
  };
}
