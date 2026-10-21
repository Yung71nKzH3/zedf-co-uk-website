/**
 * Security and sanitization utilities for UrlBase.
 * Protects against XSS (e.g. javascript: protocol execution),
 * external referrer leakage, and CSV formula injection (CWE-1236).
 */

const DANGEROUS_PROTOCOL_REGEX = /^(javascript|data|vbscript|file|blob|about):/i;
const SAFE_PROTOCOL_REGEX = /^https?:\/\//i;

/**
 * Validates and sanitizes a user-supplied URL for anchor navigation.
 * Returns a safe HTTPS/HTTP URL or an empty string if malicious/invalid.
 */
export function sanitizeExternalUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Block dangerous schemes
  if (DANGEROUS_PROTOCOL_REGEX.test(trimmed)) {
    return '';
  }

  // If already an absolute http/https URL, ensure it parses validly
  if (SAFE_PROTOCOL_REGEX.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return '';
    }
  }

  // If contains a colon with an unrecognized scheme (e.g., "intent:", "chrome:"), reject
  if (/^[a-zA-Z0-9+.-]+:/.test(trimmed)) {
    return '';
  }

  // Assume standard web address and prepend https://
  try {
    const parsed = new URL(`https://${trimmed}`);
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Returns true if the URL is safe to open in a new tab.
 */
export function isSafeExternalUrl(rawUrl: unknown): boolean {
  return sanitizeExternalUrl(rawUrl).length > 0;
}

/**
 * Neutralizes CSV/Spreadsheet formula injection (CWE-1236).
 * If a cell begins with formula trigger characters (=, +, -, @, \t, \r),
 * it prepends a single quote so spreadsheet viewers (Excel, Google Sheets, Calc)
 * render it strictly as plain text instead of executing commands.
 */
export function sanitizeCsvFormula(value: string): string {
  if (!value || typeof value !== 'string') return value;
  const firstChar = value.charAt(0);
  if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@' || firstChar === '\t' || firstChar === '\r') {
    return `'${value}`;
  }
  return value;
}
