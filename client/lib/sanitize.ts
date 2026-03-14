import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes a string to prevent XSS attacks while allowing safe HTML if needed.
 * By default, it strips ALL HTML tags.
 */
export function sanitizeContent(content: string, options: any = { USE_PROFILES: { html: false } }): string {
  if (!content) return "";
  return (DOMPurify.sanitize(content, options) as unknown) as string;
}

/**
 * Specifically for sanitizing plain text inputs (no HTML allowed).
 */
export function sanitizePlainText(text: string): string {
  return sanitizeContent(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
