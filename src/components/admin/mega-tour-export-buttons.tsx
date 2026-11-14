"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EXPORT = "/api/admin/mega-tour/export";
const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-brz-line px-3 py-2 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red disabled:opacity-50";

function fileName() {
  return `mega-tour-2026-payments-${new Date().toISOString().slice(0, 10)}.xlsx`;
}

// Phones/tablets that can hand a file to another app via the OS share sheet
// (Android Chrome, iOS Safari 15+). That's the only way a web page can get
// a file into the Excel or Google Sheets *app* — a plain download just
// lands in Downloads.
function canShareFiles() {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  try {
    return (
      !!coarse &&
      navigator.canShare({
        files: [new File([""], "x.xlsx", { type: XLSX_TYPE })],
      })
    );
  } catch {
    return false;
  }
}

function triggerDownload(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function MegaTourExportButtons() {
  const [mobileShare, setMobileShare] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // iOS Safari only allows navigator.share() straight from a tap — awaiting
  // a fetch first loses the "user gesture" and the share is refused. So on
  // share-capable devices the file is fetched ahead of time and the tap
  // shares it immediately.
  const prepared = useRef<File | null>(null);

  const prepare = useCallback(async () => {
    try {
      const res = await fetch(`${EXPORT}?format=xlsx`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      prepared.current = new File([blob], fileName(), { type: XLSX_TYPE });
      setReady(true);
    } catch {
      prepared.current = null;
      setReady(false);
    }
  }, []);

  useEffect(() => {
    if (!canShareFiles()) return;
    setMobileShare(true);
    prepare();
    // Refresh when the admin comes back to the tab, so it isn't stale.
    const onVisible = () => {
      if (document.visibilityState === "visible") prepare();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [prepare]);

  async function shareToApp(app: "Excel" | "Sheets") {
    const file = prepared.current;
    if (!file) {
      triggerDownload(`${EXPORT}?format=xlsx`);
      setHint("File downloaded — open it from your Downloads.");
      return;
    }
    try {
      await navigator.share({ files: [file], title: "Mega Tour 2026 payments" });
      setHint(null);
    } catch (err) {
      // User closed the share sheet — nothing to do.
      if (err instanceof DOMException && err.name === "AbortError") return;
      triggerDownload(`${EXPORT}?format=xlsx`);
      setHint(
        `Couldn't open the share menu, so the file was downloaded instead — open it from Downloads and choose ${app}.`
      );
    }
    // Fetch a fresh copy for the next tap.
    prepare();
  }

  function excel() {
    if (mobileShare) {
      shareToApp("Excel");
      return;
    }
    triggerDownload(`${EXPORT}?format=xlsx`);
  }

  // There's no Google API connection, so on a computer "Google Sheets"
  // means: download the .xlsx (Sheets opens it natively) and open Sheets
  // in a new tab, ready for File → Import → Upload.
  function sheets() {
    if (mobileShare) {
      shareToApp("Sheets");
      return;
    }
    triggerDownload(`${EXPORT}?format=xlsx`);
    window.open("https://docs.google.com/spreadsheets/", "_blank", "noopener");
    setHint("sheets-desktop");
  }

  const preparing = mobileShare && !ready;

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={excel} disabled={preparing} className={btn}>
          <span aria-hidden="true">📗</span> Excel
        </button>
        <button type="button" onClick={sheets} disabled={preparing} className={btn}>
          <span aria-hidden="true">📊</span> Google Sheets
        </button>
        <a href={`${EXPORT}?format=csv`} className={btn}>
          <span aria-hidden="true">⬇</span> CSV
        </a>
      </div>
      {preparing && (
        <p className="text-xs text-brz-mute">Preparing file…</p>
      )}
      {mobileShare && ready && !hint && (
        <p className="max-w-xs text-xs text-brz-mute sm:text-right">
          Tap Excel or Google Sheets, then pick that app from the share menu.
        </p>
      )}
      {hint === "sheets-desktop" ? (
        <p className="max-w-xs text-xs text-brz-mute sm:text-right">
          File downloaded. In the Google Sheets tab: <b>Blank</b> →{" "}
          <b>File → Import → Upload</b> → choose the downloaded file.
        </p>
      ) : (
        hint && (
          <p className="max-w-xs text-xs text-brz-mute sm:text-right">{hint}</p>
        )
      )}
    </div>
  );
}
