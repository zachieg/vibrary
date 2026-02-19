"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_TAGS, AI_TOOLS, SETUP_DIFFICULTIES } from "@/lib/types";
import { isValidUrl, isValidEmail, generateUniqueSlug } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FormErrors {
  [key: string]: string;
}

interface EditableFields {
  title?: string;
  tagline?: string;
  description?: string;
  demo_url?: string | null;
  repo_url?: string | null;
  build_story?: string | null;
  setup_difficulty?: string | null;
  quick_start?: string | null;
  tags?: string[];
  ai_tool_used?: string;
}

interface SubmitFormProps {
  editSlug?: string;
  initialData?: EditableFields;
}

export default function SubmitForm({ editSlug, initialData }: SubmitFormProps = {}) {
  const isEditMode = !!editSlug;
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [tagline, setTagline] = useState(initialData?.tagline ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [demoUrl, setDemoUrl] = useState(initialData?.demo_url ?? "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repo_url ?? "");
  const [buildStory, setBuildStory] = useState(initialData?.build_story ?? "");
  const [setupDifficulty, setSetupDifficulty] = useState(initialData?.setup_difficulty ?? "");
  const [quickStart, setQuickStart] = useState(initialData?.quick_start ?? "");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags ?? []);
  const [customTag, setCustomTag] = useState("");
  const [aiTool, setAiTool] = useState(initialData?.ai_tool_used ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  // honeypot
  const [hp, setHp] = useState("");

  // GitHub Import
  const [githubUrl, setGithubUrl] = useState("");
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // OG screenshot
  const [ogScreenshotUrl, setOgScreenshotUrl] = useState<string | null>(null);
  const [ogPreview, setOgPreview] = useState<{ ogImage: string | null } | null>(null);
  const [ogFetching, setOgFetching] = useState(false);

  // AI Polish
  const [polishing, setPolishing] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = "Title is required";
    else if (title.length > 100) errs.title = "Max 100 characters";

    if (!tagline.trim()) errs.tagline = "Tagline is required";
    else if (tagline.length > 200) errs.tagline = "Max 200 characters";

    if (!description.trim()) errs.description = "Description is required";
    else if (description.length > 5000) errs.description = "Max 5000 characters";

    if (demoUrl && !isValidUrl(demoUrl)) errs.demoUrl = "Must be a valid URL";
    if (repoUrl && !isValidUrl(repoUrl)) errs.repoUrl = "Must be a valid URL";

    if (buildStory.length > 3000) errs.buildStory = "Max 3000 characters";
    if (quickStart.length > 2000) errs.quickStart = "Max 2000 characters";

    if (selectedTags.length === 0) errs.tags = "Select at least one tag";
    if (selectedTags.length > 5) errs.tags = "Max 5 tags";

    if (!aiTool) errs.aiTool = "Select the AI tool used";

    if (!isEditMode) {
      if (!name.trim()) errs.name = "Name is required";
      else if (name.length > 50) errs.name = "Max 50 characters";

      if (!email.trim()) errs.email = "Email is required";
      else if (!isValidEmail(email)) errs.email = "Invalid email format";

      if (website && !isValidUrl(website)) errs.website = "Must be a valid URL";
    }

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

  async function handleGithubImport() {
    if (!githubUrl.trim()) return;
    setGithubImporting(true);
    setGithubError(null);
    try {
      const res = await fetch("/api/v1/import-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGithubError(data.error ?? "Import failed. Please try again.");
        return;
      }
      // Only fill blank fields — never overwrite user edits
      if (data.title && !title) setTitle(data.title);
      if (data.tagline && !tagline) setTagline(data.tagline);
      if (data.description && !description) setDescription(data.description);
      if (data.demoUrl && !demoUrl) setDemoUrl(data.demoUrl);
      if (data.repoUrl && !repoUrl) setRepoUrl(data.repoUrl);
      if (data.tags?.length > 0 && selectedTags.length === 0) {
        setSelectedTags(data.tags.slice(0, 5));
      }
    } catch {
      setGithubError("Network error. Please try again.");
    } finally {
      setGithubImporting(false);
    }
  }

  async function handleDemoUrlBlur() {
    if (!demoUrl.trim() || !isValidUrl(demoUrl)) return;
    setOgFetching(true);
    setOgPreview(null);
    try {
      const res = await fetch("/api/v1/fetch-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: demoUrl.trim() }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ogImage) setOgPreview(data);
    } catch {
      // Silent failure — manual upload still available
    } finally {
      setOgFetching(false);
    }
  }

  function handleUseOgImage() {
    if (ogPreview?.ogImage) {
      setOgScreenshotUrl(ogPreview.ogImage);
      setScreenshot(null);
    }
  }

  function handleClearScreenshot() {
    setOgScreenshotUrl(null);
    setOgPreview(null);
    setScreenshot(null);
  }

  async function handleAiPolish() {
    if (description.trim().length < 100) return;
    setPolishing(true);
    setPolishError(null);
    try {
      const res = await fetch("/api/v1/ai-polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), tagline: tagline.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPolishError(data.error ?? "AI polish failed. Please try again.");
        return;
      }
      if (data.tagline) setTagline(data.tagline);
      if (data.description) setDescription(data.description);
    } catch {
      setPolishError("Network error. Please try again.");
    } finally {
      setPolishing(false);
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
      if (isEditMode) {
        // PATCH existing project via API (handles auth server-side)
        const res = await fetch(`/api/v1/projects/${editSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            tagline: tagline.trim(),
            description: description.trim(),
            demo_url: demoUrl.trim() || null,
            repo_url: repoUrl.trim() || null,
            build_story: buildStory.trim() || null,
            setup_difficulty: setupDifficulty || null,
            quick_start: quickStart.trim() || null,
            tags: selectedTags,
            ai_tool_used: aiTool,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Update failed");
        }

        const updated = await res.json();
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/project/${updated.slug ?? editSlug}`);
        }, 1500);
        return;
      }

      // New submission
      const slug = generateUniqueSlug(title);
      let screenshotUrl: string | null = ogScreenshotUrl;

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
          repo_url: repoUrl.trim() || null,
          build_story: buildStory.trim() || null,
          setup_difficulty: setupDifficulty || null,
          quick_start: quickStart.trim() || null,
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
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <span className="text-6xl">{isEditMode ? "✅" : "🎉"}</span>
        <h2 className="mt-4 font-serif text-2xl font-bold text-text-primary">
          {isEditMode ? "Changes saved!" : "Your project is live!"}
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

      {/* GitHub Import */}
      {!isEditMode && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="text-sm font-medium text-text-primary">
            Import from GitHub{" "}
            <span className="font-normal text-text-secondary">— auto-fill from a public repo</span>
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleGithubImport(); }
              }}
              placeholder="https://github.com/owner/repo"
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
            />
            <button
              type="button"
              onClick={handleGithubImport}
              disabled={githubImporting || !githubUrl.trim()}
              className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90 disabled:opacity-50"
            >
              {githubImporting ? "Importing…" : "Import"}
            </button>
          </div>
          {githubError && (
            <p className="mt-1.5 text-xs text-red-500">{githubError}</p>
          )}
          {!githubError && (
            <p className="mt-1.5 text-xs text-text-secondary">
              Fills title, tagline, description, tags, and URLs. You can edit everything after.
            </p>
          )}
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

      {/* AI Polish */}
      {description.trim().length >= 100 && (
        <div className="flex items-center justify-between rounded-lg bg-violet/5 px-4 py-3">
          <p className="text-xs text-text-secondary">
            Let AI clean up the description and write a better tagline.
          </p>
          <button
            type="button"
            onClick={handleAiPolish}
            disabled={polishing}
            className="ml-4 shrink-0 rounded-lg bg-violet px-3 py-1.5 text-xs font-medium text-white hover:bg-violet/90 disabled:opacity-50"
          >
            {polishing ? "Polishing…" : "Polish with AI ✦"}
          </button>
        </div>
      )}
      {polishError && (
        <p className="text-xs text-red-500">{polishError}</p>
      )}

      {/* Demo URL */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Demo URL
        </label>
        <input
          type="url"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          onBlur={handleDemoUrlBlur}
          placeholder="https://your-project.vercel.app"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.demoUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.demoUrl}</p>
        )}
      </div>

      {/* Repository URL */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Repository URL
        </label>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/you/your-project"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.repoUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.repoUrl}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">
          Link to the source code so others (and AI agents) can learn from it.
        </p>
      </div>

      {/* Screenshot */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Screenshot
        </label>

        {ogFetching && (
          <p className="mb-2 animate-pulse text-xs text-text-secondary">Fetching preview from demo URL…</p>
        )}

        {ogPreview?.ogImage && !ogScreenshotUrl && (
          <div className="mb-3 rounded-lg border border-gray-200 p-3">
            <p className="mb-2 text-xs font-medium text-text-secondary">Found preview image from your demo URL:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogPreview.ogImage} alt="OG preview" className="max-h-40 w-auto rounded object-cover" />
            <button
              type="button"
              onClick={handleUseOgImage}
              className="mt-2 rounded-lg bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet hover:bg-violet/20"
            >
              Use this image
            </button>
          </div>
        )}

        {ogScreenshotUrl && (
          <div className="mb-3 rounded-lg border border-violet/30 bg-violet/5 p-3">
            <p className="mb-2 text-xs font-medium text-violet">Using preview image from demo URL</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogScreenshotUrl} alt="Selected preview" className="max-h-40 w-auto rounded object-cover" />
            <button
              type="button"
              onClick={handleClearScreenshot}
              className="mt-2 text-xs text-text-secondary underline hover:text-red-500"
            >
              Remove and upload manually instead
            </button>
          </div>
        )}

        {!ogScreenshotUrl && (
          <>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-coral/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-coral hover:file:bg-coral/20"
            />
            <p className="mt-1 text-xs text-text-secondary">PNG, JPG, or WebP. Max 5MB.</p>
          </>
        )}
      </div>

      {/* How I Built This */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          How I Built This
        </label>
        <textarea
          value={buildStory}
          onChange={(e) => setBuildStory(e.target.value)}
          maxLength={3000}
          rows={4}
          placeholder="What prompts worked? What AI tool features helped? What did you iterate on?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.buildStory && (
          <p className="mt-1 text-xs text-red-500">{errors.buildStory}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">
          Share your build process — this is what makes Vibrary different from GitHub. {buildStory.length}/3000
        </p>
      </div>

      {/* Setup Difficulty */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Setup Difficulty
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SETUP_DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setSetupDifficulty(setupDifficulty === d.value ? "" : d.value)}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                setupDifficulty === d.value
                  ? "border-coral bg-coral/5 text-text-primary"
                  : "border-gray-200 text-text-secondary hover:border-gray-300"
              }`}
            >
              <span className="block text-sm font-medium">{d.label}</span>
              <span className="block text-xs">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Quick Start Guide
        </label>
        <textarea
          value={quickStart}
          onChange={(e) => setQuickStart(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder={"1. Clone the repo\n2. Run npm install\n3. Add .env with SUPABASE_URL=...\n4. npm run dev"}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
        />
        {errors.quickStart && (
          <p className="mt-1 text-xs text-red-500">{errors.quickStart}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">
          Step-by-step setup so anyone (or any agent) can get running fast. {quickStart.length}/2000
        </p>
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

      {/* Submitter Info — hidden in edit mode */}
      {isEditMode && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          Editing as the project owner. Submitter info cannot be changed.
        </p>
      )}
      <div className={`grid gap-4 sm:grid-cols-2 ${isEditMode ? "hidden" : ""}`}>
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

      {!isEditMode && (
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
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-coral py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md disabled:opacity-60"
      >
        {submitting
          ? isEditMode ? "Saving..." : "Submitting..."
          : isEditMode ? "Save Changes" : "Submit Project"
        }
      </button>
    </form>
  );
}
