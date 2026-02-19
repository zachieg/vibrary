"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      title="Something went wrong"
      message="We had trouble loading this page. Please try again."
      retry={reset}
    />
  );
}
