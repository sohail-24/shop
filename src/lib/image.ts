/**
 * Helper to resolve product image URLs.
 * Ensures relative paths like "api/uploads/..." or "uploads/..." have a leading slash
 * so they resolve from root rather than relative to the current route.
 */
export function resolveProductImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}
