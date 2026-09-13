"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMedalForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "🏅",
    color: "#f5251f",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/medals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setForm({ name: "", description: "", icon: "🏅", color: "#f5251f" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 max-w-md space-y-3 p-5">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-brz-white">
        Create a new medal
      </p>
      {error && (
        <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <div className="w-16">
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Icon
          </label>
          <input
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="field text-center"
            maxLength={4}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Name
          </label>
          <input
            required
            placeholder="e.g. Host, Leader, Founding Member"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="field"
          />
        </div>
        <div className="w-16">
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Color
          </label>
          <input
            type="color"
            value={form.color}
            onChange={(e) =>
              setForm((f) => ({ ...f, color: e.target.value }))
            }
            className="h-[38px] w-full rounded-md border border-brz-line bg-brz-black"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Description (optional)
        </label>
        <input
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="field"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brz-red px-5 py-2 font-display text-sm font-bold uppercase tracking-wide text-brz-black hover:bg-brz-amber disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create medal"}
      </button>
    </form>
  );
}
