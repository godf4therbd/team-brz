"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "./logo";
import WeatherWidget from "./weather-widget";
import ThemeToggle from "./theme-toggle";
import { cn } from "@/lib/utils";

function isStaffRole(role?: string) {
  return role === "ADMIN" || role === "CO_ADMIN" || role === "MODERATOR";
}

const links = [
  { href: "/events", label: "Events" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/members", label: "Members" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
];

export default function Nav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brz-line bg-brz-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl 2xl:max-w-[1500px] items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2"
        >
          <Logo size={40} />
          <span className="hidden font-display text-lg font-bold uppercase tracking-wider text-brz-white sm:inline">
            Team <span className="text-brz-red">Brz</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium uppercase tracking-wide text-brz-mute transition hover:text-brz-white",
                pathname.startsWith(l.href) && "text-brz-red"
              )}
            >
              {l.label}
            </Link>
          ))}
          {isStaffRole(session?.user.role) && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium uppercase tracking-wide text-brz-mute transition hover:text-brz-white",
                pathname.startsWith("/admin") && "text-brz-red"
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <WeatherWidget />
          <ThemeToggle />
          {status === "loading" ? null : session ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium text-brz-mute hover:text-brz-white"
              >
                Hello, {session.user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-brz-line px-3 py-1.5 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brz-mute hover:text-brz-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brz-red px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber"
              >
                Join the club
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-brz-line text-brz-white md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-brz-line bg-brz-black px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-wide text-brz-mute hover:text-brz-white"
              >
                {l.label}
              </Link>
            ))}
            {isStaffRole(session?.user.role) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-wide text-brz-mute hover:text-brz-white"
              >
                Admin
              </Link>
            )}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-brz-line pt-3">
              <ThemeToggle />
            </div>
            <div className="mt-2 flex gap-3 border-t border-brz-line pt-3">
              {session ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="text-sm text-brz-mute hover:text-brz-white"
                  >
                    Hello, {session.user.name?.split(" ")[0]}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-semibold text-brz-red"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-sm text-brz-mute hover:text-brz-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold text-brz-red"
                  >
                    Join the club
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
