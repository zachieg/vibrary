import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Project",
  description: "Share your vibecoded project with the community.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-text-primary">
          Submit Your Project
        </h1>
        <p className="mt-2 text-text-secondary">
          Share what you&apos;ve vibecoded with the community. No account needed.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-gray-100 bg-surface p-6 shadow-sm sm:p-8">
        <SubmitForm />
      </div>
    </div>
  );
}
