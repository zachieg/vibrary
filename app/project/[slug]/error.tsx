"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function ProjectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Couldn't load this project"
      message="There was a problem fetching this project. It might be temporarily unavailable."
      retry={reset}
    />
  );
}
