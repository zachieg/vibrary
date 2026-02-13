"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_TAGS, AI_TOOLS } from "@/lib/types";
import { isValidUrl, isValidEmail, generateUniqueSlug } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FormErrors {
  [key: string]: string;
}

export default function SubmitForm() {
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [aiTool, setAiTool] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  // honeypot
  const [hp, setHp] = useState("");

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = "Title is required";
    else if (title.length > 100) errs.title = "Max 100 characters";

    if (!tagline.trim()) errs.tagline = "Tagline is required";
    else if (tagline.length > 200) errs.tagline = "Max 200 characters";

    if (!description.trim()) errs.description = "Description is required";
    else if (description.length > 5000) errs.description = "Max 5000 characters";

    if (demoUrl && !isValidUrl(demoUrl)) errs.demoUrl = "Must be a valid URL";

    if (selectedTags.length === 0) errs.tags = "Select at least one tag";
    if (selectedTags.length > 5) errs.tags = "Max 5 tags";

    if (!aiTool) errs.aiTool = "Select the AI tool used";

    if (!name.trim()) errs.name = "Name is required";
    else if (name.length > 50) errs.name = "Max 50 characters";

    if (!email.trim()) errs.email = "Email is required";
    else if (!isValidEmail(email)) errs.email = "Invalid email format";

    if (website && !isValidUrl(website)) errs.website = "Must be a valid URL";

    return errs;
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function addCustomTag() {
    const tag = customTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags((prev) => [...prev, tag]);
      setCustomTag("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (hp) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const slug = generateUniqueSlug(title);
      let screenshotUrl: string | null = null;

      if (screenshot) {
        const ext = screenshot.name.split(".").pop() || "png";
        const filename = `${slug}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("project-screenshots")
          .upload(filename, screenshot, { contentType: screenshot.type });

        if (!uploadError) {
          const { data } = supabase.storage
            .from("project-screenshots")
            .getPublicUrl(filename);
          screenshotUrl = data.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: title.trim(),
          slug,
          tagline: tagline.trim(),
          description: description.trim(),
          demo_url: demoUrl.trim() || null,
          screenshot_url: screenshotUrl,
          tags: selectedTags,
          ai_tool_used: aiTool,
          submitter_name: name.trim(),
          submitter_email: email.trim(),
          submitter_url: website.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/project/${data.slug}`);
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <span className="text-6xl">🎉</span>
        <h2 className="mt-4 font-serif text-2xl font-bold text-text-primary">
          Your project is live!
        </h2>
        <p className="mt-2 text-text-secondary">Redirecting you now...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {errors.form}
        </div>
      )}

      {/* Honeypot — hidden from users */}
      <input
        type="text"
        name="website_url"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Project Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="My Awesome Vibecoded App"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">{title.length}/100</p>
      </div>

      {/* Tagline */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Tagline *
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          maxLength={200}
          placeholder="A one-liner pitch for your project"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.tagline && (
          <p className="mt-1 text-xs text-red-500">{errors.tagline}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">{tagline.length}/200</p>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Description * <span className="font-normal text-text-secondary">(Markdown supported)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Tell us about your project. What does it do? How was it built? What was the vibe?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">
          {description.length}/5000
        </p>
      </div>

      {/* Demo URL */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Demo URL
        </label>
        <input
          type="url"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          placeholder="https://your-project.vercel.app"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.demoUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.demoUrl}</p>
        )}
      </div>

      {/* Screenshot */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Screenshot
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-coral/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-coral hover:file:bg-coral/20"
        />
        <p className="mt-1 text-xs text-text-secondary">PNG, JPG, or WebP. Max 5MB.</p>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Tags * <span className="font-normal text-text-secondary">(select up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-violet text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200 disabled:opacity-40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="Add custom tag..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
          />
          <button
            type="button"
            onClick={addCustomTag}
            disabled={selectedTags.length >= 5}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-200 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {errors.tags && (
          <p className="mt-1 text-xs text-red-500">{errors.tags}</p>
        )}
        {selectedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-violet/10 px-2.5 py-1 text-xs font-medium text-violet"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="ml-0.5 hover:text-red-500"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Tool */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          AI Tool Used *
        </label>
        <select
          value={aiTool}
          onChange={(e) => setAiTool(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        >
          <option value="">Select the AI tool you used...</option>
          {AI_TOOLS.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>
        {errors.aiTool && (
          <p className="mt-1 text-xs text-red-500">{errors.aiTool}</p>
        )}
      </div>

      {/* Submitter Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
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
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Your Email * <span className="font-normal text-text-secondary">(never shown)</span>
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Website / Profile
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://github.com/you"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.website && (
          <p className="mt-1 text-xs text-red-500">{errors.website}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-coral py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Project"}
      </button>
    </form>
  );
}
