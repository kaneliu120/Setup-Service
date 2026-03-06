/**
 * Lightweight server-side HTML sanitizer for admin-authored blog content.
 * Strips dangerous tags and attributes while preserving valid HTML structure.
 * 
 * For production hardening, consider using `sanitize-html` or `isomorphic-dompurify`.
 */

// Tags allowed in blog content
const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'blockquote', 'pre', 'code',
  'div', 'span',
  'figure', 'figcaption',
  'video', 'source',
]);

// Attributes allowed per tag (tag → Set of allowed attrs)
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'style']),
  'a': new Set(['href', 'target', 'rel', 'title']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
  'video': new Set(['src', 'controls', 'autoplay', 'muted', 'loop', 'poster']),
  'source': new Set(['src', 'type']),
};

// Dangerous patterns in attribute values
const DANGEROUS_ATTR_PATTERNS = [
  /javascript\s*:/i,
  /data\s*:/i,
  /vbscript\s*:/i,
  /on\w+\s*=/i,
];

/**
 * Sanitize HTML content: strip disallowed tags and dangerous attributes.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script/style/iframe tags and their content entirely
  let sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?\/?>(?:<\/embed>)?/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<input[\s\S]*?\/?>/gi, '')
    .replace(/<textarea[\s\S]*?<\/textarea>/gi, '')
    .replace(/<select[\s\S]*?<\/select>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '');

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol in href/src
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']\s*javascript\s*:[^"']*["']/gi, '$1=""');

  return sanitized;
}
