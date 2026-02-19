"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function CollectionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Couldn't load this collection"
      message="There was a problem loading projects in this collection. Please try again."
      retry={reset}
    />
  );
}
