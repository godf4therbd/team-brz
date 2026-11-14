"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CropDialog from "@/components/crop-dialog";
import GearList, { type GearItem } from "@/components/gear-list";
import {
  cropToJpeg,
  toDisplayableUrl,
  type CropArea,
} from "@/lib/image-client";
import {
  GEAR_CATEGORIES,
  GEAR_LABEL,
  MAX_GEAR_ITEMS,
  type GearCategory,
} from "@/lib/gear";

const input =
  "w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-sm text-brz-white outline-none placeholder:text-brz-mute/60 focus:border-brz-red";

// "My gear" on the account page: the member's gear list plus an add form.
// Gear photos are cropped square and shrunk in the browser before upload.
export default function GearManager({ items }: { items: GearItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<GearCategory>("HELMET");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = items.length >= MAX_GEAR_ITEMS;

  const closeCropper = useCallback(() => {
    setCropSrc((src) => {
      if (src) URL.revokeObjectURL(src);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  function reset() {
    setCategory("HELMET");
    setBrand("");
    setModel("");
    setNote("");
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setError(null);
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      setCropSrc(await toDisplayableUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that image.");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onCropped(area: CropArea) {
    if (!cropSrc) return;
    try {
      const file = await cropToJpeg(cropSrc, area, 1000, "gear");
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't process that image.");
    }
    closeCropper();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData();
    form.append("category", category);
    form.append("brand", brand);
    if (model.trim()) form.append("model", model);
    if (note.trim()) form.append("note", note);
    if (photo) form.append("file", photo);
    try {
      const res = await fetch("/api/account/gear", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || `Couldn't add it (${res.status}).`);
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error — item may not have been saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {items.length > 0 ? (
        <GearList items={items} canDelete />
      ) : (
        !open && (
          <p className="text-sm text-brz-mute">
            Show off your riding gear — helmet, gloves, jacket, boots,
            communicator, lights. It appears on your public profile.
          </p>
        )
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={atLimit}
          className="mt-4 rounded-md border border-brz-line px-4 py-2 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red disabled:opacity-50"
        >
          {atLimit ? `Gear list full (${MAX_GEAR_ITEMS})` : "+ Add gear"}
        </button>
      ) : (
        <form
          onSubmit={submit}
          className="mt-4 space-y-3 rounded-lg border border-brz-line bg-brz-black/40 p-4"
        >
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-brz-mute">
              Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {GEAR_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={
                    "rounded-full border px-3 py-1 text-xs font-semibold transition " +
                    (category === c
                      ? "border-brz-red bg-brz-red/15 text-brz-red"
                      : "border-brz-line text-brz-mute hover:text-brz-white")
                  }
                >
                  <span aria-hidden="true">{GEAR_LABEL[c].icon} </span>
                  {GEAR_LABEL[c].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
                Brand *
              </span>
              <input
                required
                maxLength={60}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. LS2, Alpinestars, Cardo"
                className={input}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
                Model
              </span>
              <input
                maxLength={80}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. FF800 Storm"
                className={input}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
              Note
            </span>
            <input
              maxLength={140}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. ECE 22.06, size L — best buy this year"
              className={input}
            />
          </label>

          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-brz-line bg-brz-steel text-2xl">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden="true">{GEAR_LABEL[category].icon}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-brz-line px-3 py-1.5 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red"
            >
              {photo ? "Change photo" : "Add photo (optional)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={onPickPhoto}
              className="hidden"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="flex-1 rounded-md border border-brz-line py-2 text-sm font-semibold text-brz-mute transition hover:border-brz-red hover:text-brz-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !brand.trim()}
              className="flex-1 rounded-md bg-brz-red py-2 font-display text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add to my gear"}
            </button>
          </div>
        </form>
      )}

      {cropSrc && (
        <CropDialog
          src={cropSrc}
          aspect={1}
          title="Crop gear photo"
          onCancel={closeCropper}
          onSave={onCropped}
        />
      )}
    </div>
  );
}
