/**
 * Validates file upload metadata for security.
 */

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFileUpload(file: File, type: "image" | "document"): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size exceeds 5MB limit" };
  }

  // Check file type
  const allowedTypes = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` };
  }

  return { isValid: true };
}
