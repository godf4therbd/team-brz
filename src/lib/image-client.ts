// Browser-only image helpers shared by every photo upload (profile, bike,
// gear). Images are cropped and re-encoded as JPEG in the browser before
// upload, because Vercel rejects request bodies over 4.5MB before they
// reach our routes — so big phone photos can't be sent raw.

export type CropArea = { x: number; y: number; width: number; height: number };

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // keep under Vercel's 4.5MB cap

function isHeic(file: File) {
  return (
    /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  );
}

// iPhone HEIC photos: only Safari decodes them natively. Elsewhere, convert
// to JPEG with heic2any — loaded on demand so it never weighs down pages
// that don't need it.
async function heicToJpeg(file: File): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(out) ? out[0] : out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

/** Object URL the browser can display (for the cropper), converting HEIC
 *  if needed. Caller must URL.revokeObjectURL() it when done. */
export async function toDisplayableUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    await loadImage(url);
    return url;
  } catch {
    URL.revokeObjectURL(url);
  }
  if (isHeic(file)) {
    try {
      const jpeg = URL.createObjectURL(await heicToJpeg(file));
      await loadImage(jpeg);
      return jpeg;
    } catch {
      throw new Error("Couldn't read this HEIC photo. Please try a JPG or PNG.");
    }
  }
  throw new Error(
    "This browser can't read that image format. Please try a JPG or PNG."
  );
}

/** Draws just the cropped area (natural image pixels) onto a canvas,
 *  capped at maxSide on its longest edge, and returns it as a JPEG file. */
export async function cropToJpeg(
  src: string,
  area: CropArea,
  maxSide: number,
  baseName = "photo"
): Promise<File> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(area.width, area.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width * scale));
  canvas.height = Math.max(1, Math.round(area.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image in this browser.");
  // JPEG has no transparency — fill white so transparent PNGs don't go black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  for (const quality of [0.88, 0.75, 0.6, 0.45]) {
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", quality)
    );
    if (blob && blob.size <= MAX_UPLOAD_BYTES) {
      return new File([blob], `${baseName || "photo"}.jpg`, {
        type: "image/jpeg",
      });
    }
  }
  throw new Error("Couldn't shrink this image enough to upload.");
}
