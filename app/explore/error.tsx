"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function ExploreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Couldn't load collections"
      message="There was a problem loading the explore page. Please try again."
      retry={reset}
    />
  );
}
