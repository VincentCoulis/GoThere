"use client";

import { useState } from "react";
import type { Destination } from "@/types/database";
import { approveDestination, rejectDestination } from "./actions";

export function ReviewRow({ destination }: { destination: Destination }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolved, setResolved] = useState<"approved" | "rejected" | null>(null);

  async function handleApprove() {
    setLoading(true);
    setError("");
    const result = await approveDestination(destination.id);
    if (result.success) {
      setResolved("approved");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleReject() {
    setLoading(true);
    setError("");
    const result = await rejectDestination(destination.id);
    if (result.success) {
      setResolved("rejected");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  if (resolved) {
    return (
      <div className="rounded-lg border border-zinc-100 p-4 opacity-50 dark:border-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {destination.phrase}
          </span>{" "}
          — {resolved === "approved" ? "Approved" : "Rejected"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-2">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {destination.phrase}
        </p>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {destination.url}
        </p>
        {destination.flag_reason && (
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            Flag reason: {destination.flag_reason}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
          Created {new Date(destination.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
