"use client";

import { Suspense, useActionState, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createDestination, type CreateResult } from "./actions";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import QRCode from "qrcode";

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageInner />
    </Suspense>
  );
}

function CreatePageInner() {
  const searchParams = useSearchParams();
  const prefillPhrase = searchParams.get("phrase") ?? "";

  const [state, action, pending] = useActionState<CreateResult | null, FormData>(
    createDestination,
    null
  );

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [phraseValue, setPhraseValue] = useState(prefillPhrase);
  const [urlValue, setUrlValue] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  // Success state
  if (state && "success" in state && state.success) {
    return <SuccessView phrase={state.phrase} />;
  }

  // Pending review state — URL was flagged and quarantined
  if (state && "pending_review" in state && state.pending_review) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
            <h2 className="mb-1 font-bold text-amber-800 dark:text-amber-200">
              Submitted for review
            </h2>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your destination{" "}
              <span className="font-medium">&ldquo;{state.phrase}&rdquo;</span>{" "}
              has been submitted and is awaiting admin approval. You&rsquo;ll see
              its status on your dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/create"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-zinc-900 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Create another
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-lg font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error classification for inline styling
  const errorMsg =
    state && "success" in state && !state.success ? state.error : null;
  const isDuplicateError = errorMsg?.includes("already taken");
  const isSafetyError = errorMsg?.includes("safety checks");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isLoggedIn) {
      e.preventDefault();
      const params = new URLSearchParams();
      const redirectPath = `/create${phraseValue || urlValue ? `?${new URLSearchParams({ ...(phraseValue && { phrase: phraseValue }), ...(urlValue && { url: urlValue }) }).toString()}` : ""}`;
      params.set("redirect", redirectPath);
      window.location.href = `/login?${params.toString()}`;
    }
    // If logged in, let the form submit normally via the action
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Create a destination
      </h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">
        Pick a phrase and point it at any URL.
      </p>
      <form
        action={action}
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        <input
          name="phrase"
          type="text"
          required
          value={phraseValue}
          onChange={(e) => setPhraseValue(e.target.value)}
          placeholder='Phrase, e.g. "Nike UK mens t-shirts"'
          className="rounded-lg border border-zinc-300 px-4 py-3 text-lg outline-none transition-colors focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
        />
        <input
          name="url"
          type="url"
          required
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          placeholder="https://example.com/page"
          className="rounded-lg border border-zinc-300 px-4 py-3 text-lg outline-none transition-colors focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending
            ? "Scanning & creating..."
            : isLoggedIn === false
              ? "Verify email to publish"
              : "Publish destination"}
        </button>

        {/* Inline error messages */}
        {errorMsg && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              isDuplicateError
                ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
                : isSafetyError
                  ? "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
                  : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
            }`}
          >
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}

function SuccessView({ phrase }: { phrase: string }) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://gothere.cc";
  const fullLink = `${origin}/go/${encodeURIComponent(phrase)}`;

  const generateQR = useCallback(async () => {
    if (canvasRef.current) {
      await QRCode.toCanvas(canvasRef.current, fullLink, {
        width: 200,
        margin: 2,
        color: { dark: "#18181b", light: "#ffffff" },
      });
    }
  }, [fullLink]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Your phrase is live.
        </h1>
        <p className="mb-6 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          &ldquo;{phrase}&rdquo;
        </p>

        {/* Copyable link */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
            {fullLink}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* QR code */}
        <div className="mb-6 flex justify-center">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Go to dashboard
          </Link>
          <Link
            href="/create"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-zinc-300 px-6 py-3 text-lg font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Create another
          </Link>
        </div>
      </div>
    </div>
  );
}
