import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/medals", label: "Medals", adminOnly: true },
  { href: "/admin/blog", label: "Blog", adminOnly: true },
  { href: "/admin/news", label: "News", adminOnly: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const isModerator = role === "MODERATOR";
  const visibleLinks = links.filter((l) => !isModerator || !l.adminOnly);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex items-center gap-2">
        <span className="badge border border-brz-red bg-brz-red/10 text-brz-red">
          ⚙️ {isModerator ? "Moderator" : "Admin"}
        </span>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-brz-white">
          Club control panel
        </h1>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-brz-line pb-2">
        {visibleLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold text-brz-mute hover:bg-brz-charcoal hover:text-brz-white"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
