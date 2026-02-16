/**
 * Google Safe Browsing Lookup API v4.
 * Checks a URL against Google's threat lists (malware, phishing, social engineering, unwanted software).
 * Free tier: 10,000 requests/day.
 *
 * Requires GOOGLE_SAFE_BROWSING_API_KEY in env.
 */

const THREAT_TYPES = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
] as const;

export type SafeBrowsingResult =
  | { safe: true }
  | { safe: false; threats: string[] };

export async function checkSafeBrowsing(
  url: string
): Promise<SafeBrowsingResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    // If no API key configured, allow through but log warning
    console.warn("[SafeBrowsing] No API key configured — skipping check");
    return { safe: true };
  }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            clientId: "gothere",
            clientVersion: "1.0.0",
          },
          threatInfo: {
            threatTypes: [...THREAT_TYPES],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `[SafeBrowsing] API error: ${response.status} ${response.statusText}`
      );
      // On API failure, allow through — don't block users due to outages
      return { safe: true };
    }

    const data = await response.json();

    if (data.matches && data.matches.length > 0) {
      const threats = data.matches.map(
        (m: { threatType: string }) => m.threatType
      );
      return { safe: false, threats };
    }

    return { safe: true };
  } catch (error) {
    console.error("[SafeBrowsing] Request failed:", error);
    return { safe: true };
  }
}
