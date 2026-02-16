"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { validateUrl, validatePhrase } from "@/lib/validate-url";
import { scanUrl } from "@/lib/safety/scan";

export type CreateResult =
  | { success: true; phrase: string }
  | { success: false; error: string }
  | { pending_review: true; phrase: string };

export async function createDestination(
  _prev: CreateResult | null,
  formData: FormData
): Promise<CreateResult> {
  const user = await requireUser();

  const phraseResult = validatePhrase(formData.get("phrase") as string ?? "");
  if (!phraseResult.valid) {
    return { success: false, error: phraseResult.error };
  }

  const urlResult = validateUrl(formData.get("url") as string ?? "");
  if (!urlResult.valid) {
    return { success: false, error: urlResult.error };
  }

  // Safety scan
  const verdict = await scanUrl(urlResult.url);

  if (verdict.status === "blocked") {
    return {
      success: false,
      error: "This URL didn't pass our safety checks. Edit the URL and try again.",
    };
  }

  const isFlagged = verdict.status === "warning";

  const supabase = await createClient();

  // Check if phrase already exists (ignore soft-deleted)
  const { data: existing } = await supabase
    .from("destinations")
    .select("id")
    .ilike("phrase", phraseResult.phrase)
    .is("deleted_at", null)
    .single();

  if (existing) {
    return {
      success: false,
      error: `That phrase is already taken. Try making it more specific, like "${phraseResult.phrase} official" or "${phraseResult.phrase} 2025".`,
    };
  }

  const { error } = await supabase.from("destinations").insert({
    phrase: phraseResult.phrase,
    url: urlResult.url,
    created_by: user.id,
    status: isFlagged ? "pending_review" : "active",
    flag_reason: isFlagged ? verdict.reason : null,
  });

  if (error) {
    return { success: false, error: "Failed to create destination. Try again." };
  }

  if (isFlagged) {
    return { pending_review: true, phrase: phraseResult.phrase };
  }

  return { success: true, phrase: phraseResult.phrase };
}
