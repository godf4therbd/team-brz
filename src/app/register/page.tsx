"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/spinner";
import Logo from "@/components/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bikeModel: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }
    setSuccess(data.message);
    // Auto sign-in so they land on their (pending-approval) account page.
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="flex justify-center">
        <Logo size={88} />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Join Team Brz
      </h1>
      <p className="mt-2 text-center text-sm text-brz-mute">
        Create your rider profile. An admin reviews every new member before
        you can register for rides or list gear.
      </p>
      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md border border-green-800 bg-green-950/50 px-3 py-2 text-sm text-green-300">
            {success}
          </p>
        )}
        <Field label="Full name">
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="field"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="field"
            />
          </Field>
          <Field label="City">
            <input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="field"
            />
          </Field>
        </div>
        <Field label="Bike model">
          <input
            placeholder="e.g. Yamaha MT15"
            value={form.bikeModel}
            onChange={(e) => update("bikeModel", e.target.value)}
            className="field"
          />
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brz-red py-2.5 font-display font-bold uppercase tracking-wide text-brz-black transition hover:bg-brz-amber disabled:opacity-60"
        >
          {loading && <Spinner size="1.1em" />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brz-mute">
        Already a member?{" "}
        <Link href="/login" className="text-brz-red hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
        {label}
      </label>
      {children}
    </div>
  );
}
