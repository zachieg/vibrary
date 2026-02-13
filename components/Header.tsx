"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import UserMenu from "./UserMenu";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/requests", label: "Requests" },
  { href: "/submit", label: "Submit Project" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/images/logo.png"
            alt="Vibrary"
            width={440}
            height={120}
            className="h-28 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-coral/10 text-coral"
                      : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-2 border-l border-gray-200 pl-2">
            {loading ? (
              <div className="h-7 w-7 animate-pulse rounded-full bg-gray-100" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-100 hover:text-text-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
