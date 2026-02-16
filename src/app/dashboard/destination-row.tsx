"use client";

import { useState } from "react";
import type { Destination } from "@/types/database";
import {
  deleteDestination,
  updateDestination,
  toggleDestination,
} from "./actions";

export function DestinationRow({ destination }: { destination: Destination }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${destination.phrase}"?`)) return;
    setLoading(true);
    const result = await deleteDestination(destination.id);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleToggle() {
    setLoading(true);
    const result = await toggleDestination(destination.id, !destination.is_active);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await updateDestination(destination.id, formData);
    if (result.success) {
      setEditing(false);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  if (editing) {
    return (
      <form
        action={handleUpdate}
        className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <div className="flex flex-col gap-2">
          <input
            name="phrase"
            defaultValue={destination.phrase}
            required
            className="rounded border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
          />
          <input
            name="url"
            type="url"
            defaultValue={destination.url}
            required
            className="rounded border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </form>
    );
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${
        destination.is_active
          ? "border-zinc-200 dark:border-zinc-800"
          : "border-zinc-100 opacity-50 dark:border-zinc-900"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
            {destination.phrase}
          </p>
          {destination.status === "pending_review" && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Pending review
            </span>
          )}
          {destination.status === "rejected" && (
            <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
              Rejected
            </span>
          )}
        </div>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {destination.url}
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
          {destination.click_count} click{destination.click_count !== 1 && "s"}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-1">
        <button
          onClick={handleToggle}
          disabled={loading}
          title={destination.is_active ? "Disable" : "Enable"}
          className="rounded p-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {destination.is_active ? "On" : "Off"}
        </button>
        <button
          onClick={() => setEditing(true)}
          disabled={loading}
          className="rounded p-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded p-2 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
