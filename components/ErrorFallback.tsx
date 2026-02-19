"use client";

export default function ErrorFallback({
  title = "Something went wrong",
  message = "We had trouble loading this page. Please try again.",
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl">😵</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-text-primary">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-text-secondary">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-6 inline-flex rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
