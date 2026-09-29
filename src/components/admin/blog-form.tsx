"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CoverImageUpload from "./cover-image-upload";

type Status = "DRAFT" | "PUBLISHED";

export default function BlogForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: {
    title: string;
    coverImage: string | null;
    body: string;
    status: Status;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    coverImage: initial?.coverImage ?? "",
    body: initial?.body ?? "",
    status: initial?.status ?? ("PUBLISHED" as Status),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title: form.title,
      coverImage: form.coverImage || undefined,
      body: form.body,
      status: form.status,
    };

    const res = await fetch(
      postId ? `/api/admin/blog/${postId}` : "/api/admin/blog",
      {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mt-5 max-w-2xl space-y-4 p-6">
      {error && (
        <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Title
        </label>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Recap: Our Sylhet Tea Garden Tour"
          className="field"
        />
      </div>

      <CoverImageUpload
        value={form.coverImage}
        onChange={(url) => update("coverImage", url)}
      />

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Body
        </label>
        <textarea
          required
          minLength={20}
          rows={10}
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
          placeholder="Write the full story. Leave a blank line between paragraphs."
          className="field"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Status
        </label>
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value as Status)}
          className="field"
        >
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft (hidden from the public blog)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brz-red py-2.5 font-display font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-60"
      >
        {loading ? "Saving..." : postId ? "Save changes" : "Publish post"}
      </button>
    </form>
  );
}
