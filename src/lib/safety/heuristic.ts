/**
 * Local heuristic URL analysis — no external API needed.
 * Catches obvious phishing/deception patterns instantly.
 * Runs before Gemini as a zero-cost first pass.
 */

const BRAND_KEYWORDS = [
  "paypal", "apple", "google", "microsoft", "amazon", "netflix", "facebook",
  "instagram", "whatsapp", "linkedin", "twitter", "chase", "wellsfargo",
  "bankofamerica", "citibank", "hsbc", "barclays", "santander", "revolut",
  "coinbase", "binance", "dropbox", "icloud", "outlook", "yahoo",
];

const SUSPICIOUS_TLDS = [
  ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".buzz", ".surf", ".icu",
  ".cam", ".xyz", ".click", ".link", ".rest", ".fun", ".zip", ".mov",
];

const PHISHING_PATH_KEYWORDS = [
  "login", "signin", "sign-in", "verify", "account", "secure", "update",
  "confirm", "billing", "suspend", "locked", "unusual", "authenticate",
];

export type HeuristicResult =
  | { safe: true }
  | { safe: false; reason: string };

export function checkHeuristics(url: string): HeuristicResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: "Malformed URL." };
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullUrl = parsed.href.toLowerCase();

  // 1. IP address as hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return { safe: false, reason: "URL uses an IP address instead of a domain name." };
  }

  // 2. Suspicious TLD + brand keyword combo
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));
  const hasBrandKeyword = BRAND_KEYWORDS.some((brand) => hostname.includes(brand));
  const hasPhishingPath = PHISHING_PATH_KEYWORDS.some((kw) => fullUrl.includes(kw));

  if (hasSuspiciousTld && hasBrandKeyword) {
    return {
      safe: false,
      reason: `Domain combines a well-known brand name with a suspicious TLD (${hostname}).`,
    };
  }

  // 3. Leet-speak brand impersonation (e.g. paypa1, g00gle, amaz0n)
  const leetPatterns = [
    { pattern: /paypa[l1]/i, brand: "PayPal" },
    { pattern: /g[o0]{2}g[l1]e/i, brand: "Google" },
    { pattern: /amaz[o0]n/i, brand: "Amazon" },
    { pattern: /app[l1]e/i, brand: "Apple" },
    { pattern: /micr[o0]s[o0]ft/i, brand: "Microsoft" },
    { pattern: /netf[l1]ix/i, brand: "Netflix" },
  ];

  for (const { pattern, brand } of leetPatterns) {
    // Only flag if it's NOT the real domain
    if (pattern.test(hostname) && !hostname.includes(brand.toLowerCase() + ".")) {
      // Check if this is actually a subdomain of the real brand
      const realDomains: Record<string, string[]> = {
        PayPal: ["paypal.com"],
        Google: ["google.com", "google.co.uk", "googleapis.com"],
        Amazon: ["amazon.com", "amazon.co.uk", "amazonaws.com"],
        Apple: ["apple.com", "icloud.com"],
        Microsoft: ["microsoft.com", "live.com", "outlook.com"],
        Netflix: ["netflix.com"],
      };
      const isReal = realDomains[brand]?.some((d) => hostname === d || hostname.endsWith("." + d));
      if (!isReal) {
        return {
          safe: false,
          reason: `Domain appears to impersonate ${brand} (${hostname}).`,
        };
      }
    }
  }

  // 4. Deceptive subdomains (e.g. login.paypal.com.evil.com)
  if (hasBrandKeyword && hostname.split(".").length > 3) {
    const isReal = BRAND_KEYWORDS.some((brand) => {
      return hostname.endsWith(brand + ".com") || hostname.endsWith(brand + ".co.uk");
    });
    if (!isReal) {
      return {
        safe: false,
        reason: `Domain uses a brand name as a subdomain to disguise the real host (${hostname}).`,
      };
    }
  }

  // 5. Suspicious TLD + phishing path keywords
  if (hasSuspiciousTld && hasPhishingPath) {
    return {
      safe: false,
      reason: `Suspicious TLD combined with login/verification language (${hostname}).`,
    };
  }

  return { safe: true };
}
