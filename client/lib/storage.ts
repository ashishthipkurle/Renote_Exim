/**
 * File storage utility — Nhost storage has been removed.
 * File uploads now use Cloudinary via the API routes.
 * These functions are kept as stubs to avoid breaking any leftover imports.
 */

export async function uploadFile(file: File, bucketId: string = "default") {
  console.warn("[storage] Nhost storage is no longer available. Use Cloudinary instead.");
  return { fileId: null, error: { message: "Storage not configured. Use Cloudinary." } };
}

export async function getPresignedUrl(fileId: string): Promise<string | null> {
  console.warn("[storage] Nhost storage is no longer available. Use Cloudinary instead.");
  return null;
}
