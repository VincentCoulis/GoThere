import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ReviewRow } from "./review-row";
import type { Destination } from "@/types/database";

export default async function ReviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("destinations")
    .select("*")
    .eq("status", "pending_review")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto min-h-dvh max-w-2xl bg-white px-4 py-12 dark:bg-zinc-950">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Review queue
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Flagged destinations awaiting approval
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Back to dashboard
        </Link>
      </div>

      {!pending || pending.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 dark:text-zinc-600">
          <p className="text-lg">No destinations pending review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.map((dest: Destination) => (
            <ReviewRow key={dest.id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
}
