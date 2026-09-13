"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/spinner";

export default function RegisterButton({
  slug,
  isRegistered,
  isPast,
  isFull,
}: {
  slug: string;
  isRegistered: boolean;
  isPast: boolean;
  isFull: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [registered, setRegistered] = useState(isRegistered);

  if (isPast) {
    return (
      <span className="badge border border-brz-line text-brz-mute">
        This event has ended
      </span>
    );
  }

  if (status === "loading") return null;

  if (!session) {
    return (
      <Link
        href={`/login?callbackUrl=/events/${slug}`}
        className="inline-block rounded-md bg-brz-red px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-black hover:bg-brz-amber"
      >
        Sign in to register
      </Link>
    );
  }

  if (!session.user.approved) {
    return (
      <span className="badge border border-yellow-700 bg-yellow-950/40 text-yellow-400">
        ⏳ Waiting on admin approval before you can register
      </span>
    );
  }

  async function toggle() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/events/${slug}/register`, {
      method: registered ? "DELETE" : "POST",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error);
      return;
    }
    setRegistered(!registered);
    setMessage(data.message);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={loading}
        className={
          registered
            ? "flex items-center gap-2 rounded-md border border-brz-line px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-white hover:border-red-500 hover:text-red-400"
            : "flex items-center gap-2 rounded-md bg-brz-red px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-black hover:bg-brz-amber"
        }
      >
        {loading && <Spinner size="1.1em" />}
        {loading
          ? "Please wait..."
          : registered
          ? "Cancel registration"
          : isFull
          ? "Join waitlist"
          : "Register for this ride"}
      </button>
      {message && <p className="mt-2 text-sm text-brz-mute">{message}</p>}
    </div>
  );
}
