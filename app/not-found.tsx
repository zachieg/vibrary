import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl">🤷</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-text-primary">
        Page Not Found
      </h1>
      <p className="mt-2 text-text-secondary">
        This page doesn&apos;t exist. Maybe you should vibecode it?
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md"
      >
        Go Home
      </Link>
    </div>
  );
}
