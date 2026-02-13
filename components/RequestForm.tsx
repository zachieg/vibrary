"use client";

import { useState } from "react";
import { ALL_TAGS } from "@/lib/types";
import { isValidEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FormErrors {
  [key: string]: string;
}

export default function RequestForm({ onSuccess }: { onSuccess: () => void }) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = "Title is required";
    else if (title.length > 100) errs.title = "Max 100 characters";

    if (!description.trim()) errs.description = "Description is required";
    else if (description.length > 1000) errs.description = "Max 1000 characters";

    if (selectedTags.length > 3) errs.tags = "Max 3 tags";

    if (!name.trim()) errs.name = "Name is required";
    else if (name.length > 50) errs.name = "Max 50 characters";

    if (!email.trim()) errs.email = "Email is required";
    else if (!isValidEmail(email)) errs.email = "Invalid email format";

    return errs;
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const { error } = await supabase.from("project_requests").insert({
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        requester_name: name.trim(),
        requester_email: email.trim(),
      });

      if (error) throw error;
      onSuccess();
    } catch (err) {
      console.error("Submit request error:", err);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.form}
        </div>
      )}

      <input
        type="text"
        name="company"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          What do you want built? *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="A budget tracker that actually makes sense"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Describe it *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Describe what you want and why it would be useful..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">
          {description.length}/1000
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Tags <span className="font-normal text-text-secondary">(up to 3)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.slice(0, 15).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              disabled={selectedTags.length >= 3 && !selectedTags.includes(tag)}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-violet text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200 disabled:opacity-40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {errors.tags && (
          <p className="mt-1 text-xs text-red-500">{errors.tags}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Alex"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            Your Email * <span className="font-normal text-text-secondary">(hidden)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-coral py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
