"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ReviewResult = { success: true } | { success: false; error: string };

export async function approveDestination(id: string): Promise<ReviewResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("destinations")
    .update({ status: "active", flag_reason: null })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Failed to approve destination." };
  }

  revalidatePath("/dashboard/review");
  return { success: true };
}

export async function rejectDestination(id: string): Promise<ReviewResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("destinations")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Failed to reject destination." };
  }

  revalidatePath("/dashboard/review");
  return { success: true };
}
