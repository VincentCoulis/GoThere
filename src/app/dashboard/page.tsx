import { requireUser, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DestinationRow } from "./destination-row";
import type { Destination } from "@/types/database";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const userIsAdmin = isAdmin(user.email);

  const { data: destinations } = await supabase
    .from("destinations")
    .select("*")
    .eq("created_by", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // If admin, get count of pending reviews
  let pendingCount = 0;
  if (userIsAdmin) {
    const { count } = await supabase
      .from("destinations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review")
      .is("deleted_at", null);
    pendingCount = count ?? 0;
  }

  return (
    <div className="mx-auto min-h-dvh max-w-2xl bg-white px-4 py-12 dark:bg-zinc-950">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Your destinations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
        <div className="flex gap-2">
          {userIsAdmin && (
            <Link
              href="/dashboard/review"
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              Review{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </Link>
          )}
          <Link
            href="/create"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            + New
          </Link>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {!destinations || destinations.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 dark:text-zinc-600">
          <p className="mb-4 text-lg">No destinations yet.</p>
          <Link
            href="/create"
            className="text-zinc-900 underline dark:text-zinc-50"
          >
            Create your first one
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {destinations.map((dest: Destination) => (
            <DestinationRow key={dest.id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
}
