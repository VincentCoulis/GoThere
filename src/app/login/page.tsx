"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirect) {
      callbackUrl.searchParams.set("next", redirect);
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Sign in to GoThere
      </h1>
      <p className="mb-8 text-zinc-500 dark:text-zinc-400">
        We&apos;ll send you a magic link to sign in.
      </p>

      {status === "sent" ? (
        <div className="w-full max-w-sm rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          Check your email for a sign-in link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-lg outline-none transition-colors focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-zinc-900 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {status === "loading" ? "Sending..." : "Send magic link"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
          )}
        </form>
      )}
    </div>
  );
}
