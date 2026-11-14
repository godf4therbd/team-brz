"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { passId } from "@/lib/mega-tour";

export type MegaTourPassData = {
  name: string;
  role: string; // "Rider" | "Pillion"
  bloodGroup: string;
  regNumber: string;
  serial: number | null;
  phone: string; // digits only — encoded in the QR link
  confirmed: boolean;
};

// A ticket-style pass. Deliberately fixed dark colours (not theme tokens):
// it's meant to look like a printed pass in either site theme. Only the
// side notches use the page background token so they read as cut-outs.
export default function MegaTourPass({
  data,
  checkUrl,
}: {
  data: MegaTourPassData;
  // Absolute URL of the check page with ?phone= — what the QR opens.
  checkUrl: string;
}) {
  const isPillion = data.role === "Pillion";

  return (
    <div
      className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#1a1a1e] text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
      aria-label={`Mega Tour 2026 pass for ${data.name}`}
    >
      {/* Top half */}
      <div className="relative px-7 pb-8 pt-7">
        {/* Red grid, fading out toward the bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,37,31,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(245,37,31,0.22) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage:
              "radial-gradient(ellipse 90% 75% at 50% 35%, black 20%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 75% at 50% 35%, black 20%, transparent 80%)",
          }}
        />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt=""
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-display text-lg font-bold uppercase tracking-wide">
                Team Brz
              </span>
            </div>
            <span className="rounded-full border border-[#f5251f] px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5251f]">
              {isPillion ? "Pillion Pass" : "Rider Pass"}
            </span>
          </div>

          <h2 className="mt-8 bg-gradient-to-b from-white to-white/75 bg-clip-text font-display text-[2.6rem] font-bold uppercase leading-[0.95] tracking-tight text-transparent">
            Mega Tour
            <br />
            2026
          </h2>
          <p className="mt-3 text-sm leading-snug text-white/55">
            Dhaka → Bandarban → Bogalake → Tindu → White Peak
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Name" value={data.name} />
            <Field label="Blood group" value={data.bloodGroup || "—"} />
            {isPillion ? (
              <Field label="Pass type" value="Pillion" />
            ) : (
              <Field label="Bike number" value={data.regNumber || "—"} />
            )}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
                Payment status
              </dt>
              <dd
                className={
                  "mt-1 font-display text-lg font-bold " +
                  (data.confirmed ? "text-[#4ade80]" : "text-[#f87171]")
                }
              >
                {data.confirmed ? "Paid" : "Unpaid"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Perforation: dashed line with notches cut into both sides */}
      <div className="relative h-0" aria-hidden="true">
        <div className="absolute inset-x-12 -top-px border-t-2 border-dashed border-white/20" />
        <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-brz-black" />
        <span className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-brz-black" />
      </div>

      {/* Stub */}
      <div className="flex items-end justify-between gap-4 bg-[#232327] px-7 pb-7 pt-8">
        <div>
          <div className="rounded-xl bg-white p-2.5">
            <QRCodeSVG
              value={checkUrl}
              size={96}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
              title="Scan to check payment status"
            />
          </div>
          <p className="mt-3 font-mono text-xs tracking-widest text-white/45">
            {passId(data.serial)}
          </p>
        </div>
        <div className="pb-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Seat
          </p>
          <p className="font-display text-6xl font-bold leading-none text-[#f5251f] [text-shadow:0_0_24px_rgba(245,37,31,0.65)]">
            {data.serial ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
        {label}
      </dt>
      <dd className="mt-1 break-words font-display text-lg font-bold leading-snug">
        {value}
      </dd>
    </div>
  );
}
