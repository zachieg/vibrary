import type { Project } from "./types";

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.tagline,
    url: `https://vibrary.vercel.app/project/${project.slug}`,
    image: project.screenshot_url ?? undefined,
    author: {
      "@type": "Person",
      name: project.submitter_name,
    },
    datePublished: project.created_at,
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
