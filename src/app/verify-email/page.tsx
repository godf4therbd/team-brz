import Link from "next/link";
import Logo from "@/components/logo";

const MESSAGES: Record<string, { title: string; body: string; ok: boolean }> = {
  success: {
    title: "Email confirmed",
    body: "Your email address is confirmed. Thanks!",
    ok: true,
  },
  invalid: {
    title: "Link not valid",
    body: "This confirmation link isn't valid. It may have already been used.",
    ok: false,
  },
  expired: {
    title: "Link expired",
    body: "This confirmation link has expired. Sign in and request a new one from your account page.",
    ok: false,
  },
  missing: {
    title: "No token",
    body: "This link is missing its confirmation code.",
    ok: false,
  },
};

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const info = MESSAGES[searchParams.status ?? ""] ?? {
    title: "Check your email",
    body: "We sent a confirmation link to your email address when you signed up. Click it to confirm your account.",
    ok: true,
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="flex justify-center">
        <Logo size={88} />
      </div>
      <div className="card mt-8 p-6 text-center">
        <h1
          className={`font-display text-2xl font-bold uppercase tracking-wide ${
            info.ok ? "text-brz-white" : "text-red-400"
          }`}
        >
          {info.title}
        </h1>
        <p className="mt-3 text-sm text-brz-mute">{info.body}</p>
        <Link
          href="/account"
          className="mt-6 inline-block text-sm text-brz-red hover:underline"
        >
          Go to your account
        </Link>
      </div>
    </div>
  );
}
