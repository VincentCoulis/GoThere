/**
 * Gemini Flash heuristic URL analysis.
 * Catches suspicious patterns that aren't in threat databases yet:
 * typosquatting, deceptive subdomains, misleading paths, newly registered domains, etc.
 *
 * Requires GEMINI_API_KEY in env.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export type GeminiScanResult =
  | { safe: true }
  | { safe: false; reason: string };

function stripMarkdownCodeFences(text: string): string {
  // Common failure mode: models wrap JSON with ```json ... ```
  // Keep it simple: remove any leading/trailing fenced markers.
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractFirstJsonObject(text: string): string | null {
  // Some Gemini responses may include additional text ("thoughts") despite instructions.
  // Extract the first top-level JSON object by brace matching.
  const s = stripMarkdownCodeFences(text);
  const start = s.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) {
      return s.slice(start, i + 1).trim();
    }
  }

  return null;
}

const SYSTEM_PROMPT = `You are a URL safety analyst. Given a URL, analyze it for suspicious patterns.

Check for:
- Typosquatting (e.g. "go0gle.com", "amaz0n.com", "paypa1.com")
- Deceptive subdomains (e.g. "login.paypal.com.evil.com")
- Excessive subdomains used to hide the real domain
- Suspicious TLDs commonly used for phishing (especially .tk and .xyz; also .ml, .ga, .cf, .gq, .top). Treat these as HIGH RISK when combined with brand-like keywords or login/verification intent (e.g. "paypal", "paypa1", "secure", "login", "verify", "account", "billing", "support").
- URL path mimicking a legitimate site's login page on an unrelated domain
- Homograph attacks / IDN tricks (Unicode confusables, mixed scripts). Consider punycode ("xn--...") and lookalike characters (e.g. "раураl.com" using Cyrillic).
- IP address as hostname (e.g. http://192.168.1.1/login)

Respond with ONLY valid JSON (no thoughts, no markdown, no code fences) in this exact format:
{"safe": true}
OR
{"safe": false, "reason": "Brief explanation of the concern"}

Be conservative — only flag URLs that show clear deceptive intent. However, if the domain strongly resembles a well-known brand AND includes login/security language AND uses a suspicious TLD (e.g. "paypa1-secure-login.tk"), it should be flagged as unsafe. Well-known domains (google.com, amazon.com, bbc.co.uk, nike.com, etc.) should always be safe.`;

export async function scanWithGemini(url: string): Promise<GeminiScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[GeminiScan] No API key configured — skipping check");
    return { safe: true };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `Analyze this URL for safety: ${url}` }],
        },
      ],
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 150,
        responseMimeType: "application/json",
      },
    });

    const raw = result.response.text();
    const json = extractFirstJsonObject(raw);
    if (!json) {
      // If the model didn't return parseable JSON, fail open.
      return { safe: true };
    }

    const parsed = JSON.parse(json);

    if (typeof parsed.safe === "boolean") {
      return parsed.safe
        ? { safe: true }
        : { safe: false, reason: parsed.reason || "Flagged as suspicious." };
    }

    return { safe: true };
  } catch (error) {
    console.error("[GeminiScan] Analysis failed:", error);
    // On failure, allow through — don't block due to LLM errors
    return { safe: true };
  }
}
