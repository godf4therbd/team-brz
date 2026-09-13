import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/medals", label: "Medals" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex items-center gap-2">
        <span className="badge border border-brz-red bg-brz-red/10 text-brz-red">
          ⚙️ Admin
        </span>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-brz-white">
          Club control panel
        </h1>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-brz-line pb-2">
        {links.map((l) => (
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
