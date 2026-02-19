import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/json-ld";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const BASE_URL = "https://vibrary.vercel.app";

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLdItems = items.map((item) => ({
    name: item.label,
    url: item.href ? `${BASE_URL}${item.href}` : BASE_URL,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(jsonLdItems)),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <ol className="flex items-center gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-coral transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-text-primary max-w-[240px] truncate">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
