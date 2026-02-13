"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      setDisplayName(meta?.full_name || meta?.user_name || "");
      setAvatarUrl(meta?.avatar_url || "");
      setBio(meta?.bio || "");
      setWebsite(meta?.website || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName.trim(),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
        website: website.trim(),
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      await refreshUser();
      setMessage({ type: "success", text: "Settings saved!" });
    }
    setSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral" />
      </div>
    );
  }

  const previewAvatar = avatarUrl.trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your profile and preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          {previewAvatar ? (
            <Image
              src={previewAvatar}
              alt="Avatar preview"
              width={72}
              height={72}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-coral/10 text-2xl font-bold text-coral">
              {(displayName || user.email || "U")[0].toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
            />
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us about yourself..."
            className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
          <p className="mt-1 text-xs text-text-secondary">
            {bio.length}/160 characters
          </p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="mt-1 w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-text-secondary"
          />
          <p className="mt-1 text-xs text-text-secondary">
            Managed by your login provider
          </p>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/profile"
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
