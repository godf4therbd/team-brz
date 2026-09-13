"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/spinner";
import Logo from "@/components/logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(params.get("callbackUrl") || "/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="flex justify-center">
        <Logo size={88} />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Sign in
      </h1>
      <p className="mt-2 text-center text-sm text-brz-mute">
        Welcome back. Enter your rider credentials.
      </p>
      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
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
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Password
          </label>
          <input
            type="password"
            required
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brz-mute">
        Not a member yet?{" "}
        <Link href="/register" className="text-brz-red hover:underline">
          Join the club
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
