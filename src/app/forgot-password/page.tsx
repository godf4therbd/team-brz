"use client";

import { useState } from "react";
import Link from "next/link";
import Spinner from "@/components/spinner";
import Logo from "@/components/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setMessage(data.message);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="flex justify-center">
        <Logo size={88} />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Reset password
      </h1>
      <p className="mt-2 text-center text-sm text-brz-mute">
        Enter your account email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-md border border-green-800 bg-green-950/50 px-3 py-2 text-sm text-green-300">
            {message}
          </p>
        )}
        {!message && (
          <>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brz-red py-2.5 font-display font-bold uppercase tracking-wide text-brz-black transition hover:bg-brz-amber disabled:opacity-60"
            >
              {loading && <Spinner size="1.1em" />}
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </>
        )}
      </form>
      <p className="mt-4 text-center text-sm text-brz-mute">
        <Link href="/login" className="text-brz-red hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
