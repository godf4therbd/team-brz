import Image from "next/image";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  CO_ADMIN: "Co-Admin",
  MODERATOR: "Moderator",
};

// The "member card" at the top of each profile — like a club ID card.
// Deliberately fixed dark colours (matching the Mega Tour pass), so it reads
// as a physical card in either site theme.
export default function MemberCard({
  name,
  avatarUrl,
  verified,
  role,
  bikeModel,
  city,
}: {
  name: string;
  avatarUrl: string | null;
  verified: boolean;
  role: string;
  bikeModel: string | null;
  city: string | null;
}) {
  const roleLabel = ROLE_LABEL[role];

  return (
    <section
      aria-label={`${name}'s member card`}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#161619] px-6 pb-7 pt-6 text-center text-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]"
    >
      {/* Faint red grid, fading out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,37,31,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(245,37,31,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 85%)",
        }}
      />

      <div className="relative">
        <p className="flex items-center justify-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
          <Image
            src="/images/logo.png"
            alt=""
            width={18}
            height={18}
            className="rounded-sm"
          />
          Team <span className="text-[#f5251f]">Brz</span>
        </p>

        <div className="mx-auto mt-5 h-28 w-28 rounded-full p-[3px] shadow-[0_0_24px_rgba(245,37,31,0.35)] [background:linear-gradient(145deg,#f5251f,#7a0f0c)]">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#232327] font-display text-4xl font-bold text-[#f5251f]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {(verified || roleLabel) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                <span aria-hidden="true">🛡️</span> Verified
              </span>
            )}
            {roleLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#f5251f]/50 bg-[#f5251f]/10 px-2.5 py-0.5 text-xs font-semibold text-[#ff6b66]">
                <span aria-hidden="true">⚙️</span> {roleLabel}
              </span>
            )}
          </div>
        )}

        <h1 className="mt-3 break-words font-display text-2xl font-bold uppercase tracking-wide">
          {name}
        </h1>

        <div className="mx-auto my-4 h-px w-4/5 bg-gradient-to-r from-transparent via-[#f5251f]/50 to-transparent" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">
          Rides
        </p>
        <p className="mt-1 break-words font-display text-lg font-bold uppercase tracking-wide text-[#f5251f]">
          {bikeModel || "—"}
        </p>
        {city && <p className="mt-1 text-sm text-white/60">{city}</p>}
      </div>
    </section>
  );
}
