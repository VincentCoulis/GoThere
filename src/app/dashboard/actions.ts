"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { validateUrl, validatePhrase } from "@/lib/validate-url";
import { scanUrl } from "@/lib/safety/scan";

export type ActionResult = { success: true } | { success: false; error: string };

export async function deleteDestination(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("destinations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return { success: false, error: "Failed to delete." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateDestination(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const phraseResult = validatePhrase(formData.get("phrase") as string ?? "");
  if (!phraseResult.valid) return { success: false, error: phraseResult.error };

  const urlResult = validateUrl(formData.get("url") as string ?? "");
  if (!urlResult.valid) return { success: false, error: urlResult.error };

  // Safety scan the new URL
  const verdict = await scanUrl(urlResult.url);
  if (verdict.status === "blocked") {
    return { success: false, error: `This URL was blocked: ${verdict.reason}` };
  }

  const isFlagged = verdict.status === "warning";

  const supabase = await createClient();

  // Check phrase isn't taken by someone else
  const { data: existing } = await supabase
    .from("destinations")
    .select("id")
    .ilike("phrase", phraseResult.phrase)
    .neq("id", id)
    .is("deleted_at", null)
    .single();

  if (existing) {
    return { success: false, error: "That phrase is already taken." };
  }

  const updateData: Record<string, unknown> = {
    phrase: phraseResult.phrase,
    url: urlResult.url,
  };

  if (isFlagged) {
    updateData.status = "pending_review";
    updateData.flag_reason = verdict.reason;
  }

  const { error } = await supabase
    .from("destinations")
    .update(updateData)
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return { success: false, error: "Failed to update." };
  }

  revalidatePath("/dashboard");

  if (isFlagged) {
    return { success: false, error: "URL was flagged — your destination has been sent for review." };
  }

  return { success: true };
}

export async function toggleDestination(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("destinations")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return { success: false, error: "Failed to update." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
