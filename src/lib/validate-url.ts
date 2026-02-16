const ALLOWED_PROTOCOLS = ["http:", "https:"];
const MAX_URL_LENGTH = 2048;

/**
 * Last-line-of-defense check before redirecting. Use at the redirect boundary
 * (route handler) to block dangerous URLs even if bad data is in the database.
 */
export function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateUrl(input: string): { valid: true; url: string } | { valid: false; error: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: "URL is required." };
  }

  if (input.length > MAX_URL_LENGTH) {
    return { valid: false, error: `URL must be under ${MAX_URL_LENGTH} characters.` };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { valid: false, error: "Not a valid URL. Include https://." };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, error: "Only http and https URLs are allowed." };
  }

  if (!parsed.hostname.includes(".")) {
    return { valid: false, error: "URL must have a valid domain." };
  }

  return { valid: true, url: parsed.href };
}

export function validatePhrase(input: string): { valid: true; phrase: string } | { valid: false; error: string } {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Phrase is required." };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: "Phrase must be at least 2 characters." };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: "Phrase must be under 200 characters." };
  }

  return { valid: true, phrase: trimmed };
}
