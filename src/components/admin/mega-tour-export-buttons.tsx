"use client";

import { useState } from "react";

const EXPORT = "/api/admin/mega-tour/export";

const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-brz-line px-3 py-2 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red";

export default function MegaTourExportButtons() {
  const [sheetsHint, setSheetsHint] = useState(false);

  // There's no Google API connection any more, so "Google Sheets" means:
  // download the .xlsx (which Sheets opens natively) and open Sheets in a
  // new tab, ready for File → Import → Upload.
  function openInSheets() {
    const a = document.createElement("a");
    a.href = `${EXPORT}?format=xlsx`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.open("https://docs.google.com/spreadsheets/", "_blank", "noopener");
    setSheetsHint(true);
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <a href={`${EXPORT}?format=xlsx`} className={btn}>
          <span aria-hidden="true">📗</span> Excel
        </a>
        <button type="button" onClick={openInSheets} className={btn}>
          <span aria-hidden="true">📊</span> Google Sheets
        </button>
        <a href={`${EXPORT}?format=csv`} className={btn}>
          <span aria-hidden="true">⬇</span> CSV
        </a>
      </div>
      {sheetsHint && (
        <p className="max-w-xs text-xs text-brz-mute sm:text-right">
          File downloaded. In the Google Sheets tab: <b>Blank</b> →{" "}
          <b>File → Import → Upload</b> → choose the downloaded file.
        </p>
      )}
    </div>
  );
}
