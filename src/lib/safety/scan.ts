/**
 * Layered URL safety scan.
 *
 * Layer 1: Google Safe Browsing — checks against known threat databases.
 *          If flagged → BLOCK (hard fail, known malicious).
 *
 * Layer 2: Local heuristics — instant pattern matching for phishing signals.
 *          If flagged → WARN (no API needed, catches obvious impersonation).
 *
 * Layer 3: Gemini Flash — AI analysis for subtle deception patterns.
 *          If flagged → WARN. If unavailable, silently skipped (layers 1+2 still protect).
 */

import { checkSafeBrowsing } from "./safe-browsing";
import { checkHeuristics } from "./heuristic";
import { scanWithGemini } from "./gemini-scan";

export type ScanVerdict =
  | { status: "clean" }
  | { status: "blocked"; reason: string }
  | { status: "warning"; reason: string };

export async function scanUrl(url: string): Promise<ScanVerdict> {
  // Layer 1: Known threats (hard block)
  const sbResult = await checkSafeBrowsing(url);
  if (!sbResult.safe) {
    return {
      status: "blocked",
      reason: `Known threat detected: ${sbResult.threats.join(", ").toLowerCase()}.`,
    };
  }

  // Layer 2: Local heuristics (instant, no API)
  const heuristicResult = checkHeuristics(url);
  if (!heuristicResult.safe) {
    return {
      status: "warning",
      reason: heuristicResult.reason,
    };
  }

  // Layer 3: Gemini AI analysis (bonus layer, skipped if unavailable)
  const geminiResult = await scanWithGemini(url);
  if (!geminiResult.safe) {
    return {
      status: "warning",
      reason: geminiResult.reason,
    };
  }

  return { status: "clean" };
}
