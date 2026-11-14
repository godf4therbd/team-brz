import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Image uploads (profile/bike/gear photos) go to Vercel Blob once
// BLOB_READ_WRITE_TOKEN is configured — the store must have *public*
// access, since these URLs are shown publicly on profiles. Locally,
// without that token, we fall back to writing into public/uploads/ so the
// feature is testable without a Blob account — but that fallback is
// refused outside development, since a real deployment's filesystem is
// ephemeral/read-only and a "successful" upload would silently vanish.

export const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// The browser crops/shrinks to JPEG before sending, so real uploads are
// far smaller. 4.5MB is also Vercel's hard request-body cap.
export const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export class StorageNotConfiguredError extends Error {}

/** Returns an error message for the member, or null if the file is OK. */
export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.has(file.type)) {
    return "Couldn't process that image. Please try a JPG or PNG.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image is too large to upload. Please try a smaller photo.";
  }
  return null;
}

/**
 * Stores an image and returns its public URL.
 * @param folder e.g. "avatars", "bikes", "gear"
 * @param baseName file name without extension
 */
export async function storeImage(
  folder: string,
  baseName: string,
  file: File
): Promise<string> {
  const filename = `${baseName}.${EXT_BY_TYPE[file.type] || "jpg"}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  }

  if (process.env.NODE_ENV !== "production") {
    // Local-dev-only fallback — never runs against a real deployment.
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer())
    );
    return `/uploads/${folder}/${filename}`;
  }

  throw new StorageNotConfiguredError(
    "Photo storage isn't configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) in the deployment's environment variables."
  );
}
