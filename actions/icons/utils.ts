/**
 * Sanitizes and formats class name to follow naming conventions
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes invalid characters
 * - Ensures 'icon-' prefix
 */
export function sanitizeClassName(input: string): string {
  let sanitized = input
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single

  // Ensure icon- prefix
  if (!sanitized.startsWith('icon-')) {
    sanitized = `icon-${sanitized}`;
  }

  return sanitized;
}

/**
 * Validates SVG string
 */
export function validateSVG(svgString: string): boolean {
  if (!svgString || !svgString.trim()) return false;

  // Basic SVG validation - check for opening/closing svg tags
  const hasSvgTag = /<svg[\s\S]*?>[\s\S]*<\/svg>/i.test(svgString);

  return hasSvgTag;
}
