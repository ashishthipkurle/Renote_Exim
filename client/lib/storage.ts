import { nhost } from "./nhost";

/**
 * Uploads a file to Nhost Storage.
 * @param file The file object to upload
 * @param bucketId The specific bucket ID to upload to (default: "default")
 * @returns An object containing the fileId and error (if any)
 */
export async function uploadFile(file: File, bucketId: string = "default") {
  try {
    const { fileMetadata, error } = await nhost.storage.upload({
      file,
      bucketId,
    });

    if (error) {
      return { fileId: null, error };
    }

    return { fileId: fileMetadata?.id, error: null };
  } catch (err: any) {
    return { fileId: null, error: { message: err.message || "Upload failed" } };
  }
}

/**
 * Gets a presigned URL for a specific file ID in Nhost Storage.
 * @param fileId The ID of the file
 * @returns The public/presigned URL string
 */
export async function getPresignedUrl(fileId: string): Promise<string | null> {
  try {
    const { presignedUrl, error } = await nhost.storage.getPresignedUrl({
      fileId,
    });

    if (error) {
      console.error("Error getting presigned URL:", error.message);
      return null;
    }

    return presignedUrl.url;
  } catch (err) {
    console.error("Error fetching URL:", err);
    return null;
  }
}
