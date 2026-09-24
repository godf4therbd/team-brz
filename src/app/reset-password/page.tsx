"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/spinner";
import Logo from "@/components/logo";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="flex justify-center">
        <Logo size={88} />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Choose a new password
      </h1>
      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        {!token && (
          <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            This link is missing its reset code. Request a new one from the{" "}
            <Link href="/forgot-password" className="underline">
              reset password
            </Link>{" "}
            page.
          </p>
        )}
        {error && (
          <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md border border-green-800 bg-green-950/50 px-3 py-2 text-sm text-green-300">
            Password updated! Redirecting to sign in...
          </p>
        )}
        {token && !success && (
          <>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
                New password (min. 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brz-red py-2.5 font-display font-bold uppercase tracking-wide text-brz-black transition hover:bg-brz-amber disabled:opacity-60"
            >
              {loading && <Spinner size="1.1em" />}
              {loading ? "Saving..." : "Save new password"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
