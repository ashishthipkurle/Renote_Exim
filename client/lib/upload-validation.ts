export const UPLOAD_RULES = {
  compliance: {
    allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  productImage: {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  messageAttachment: {
    allowedTypes: [
      "application/pdf", 
      "image/jpeg", 
      "image/png", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  orderTradeDocument: {
    allowedTypes: ["application/pdf"],
    maxSize: 20 * 1024 * 1024, // 20MB
  }
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  bucket?: "private" | "public_images";
}

export type UploadCategory = keyof typeof UPLOAD_RULES;

export function validateFileUpload(file: File, category: UploadCategory): FileValidationResult {
  const rules = UPLOAD_RULES[category];

  if (file.size > rules.maxSize) {
    return { isValid: false, error: `File size exceeds ${rules.maxSize / (1024 * 1024)}MB limit.` };
  }

  if (!rules.allowedTypes.includes(file.type)) {
    return { isValid: false, error: `Invalid file type. Allowed: ${rules.allowedTypes.join(", ")}` };
  }

  const bucket = category === "productImage" ? "public_images" : "private";

  return { isValid: true, bucket };
}
