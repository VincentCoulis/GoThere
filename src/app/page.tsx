"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}

interface Suggestion {
  phrase: string;
  url: string;
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPhrase = searchParams.get("q") ?? "";
  const [phrase, setPhrase] = useState(queryPhrase);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect "not found" state: ?q= is present but no suggestions matched
  useEffect(() => {
    if (!queryPhrase) {
      setNotFound(false);
      return;
    }
    // Check if phrase exists via suggest API
    const controller = new AbortController();
    fetch(`/api/suggest?q=${encodeURIComponent(queryPhrase)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: Suggestion[]) => {
        const exactMatch = data.some(
          (s) => s.phrase.toLowerCase() === queryPhrase.toLowerCase()
        );
        setNotFound(!exactMatch);
      })
      .catch(() => {
        setNotFound(true);
      });
    return () => controller.abort();
  }, [queryPhrase]);

  useEffect(() => {
    if (phrase.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/suggest?q=${encodeURIComponent(phrase.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
          setActiveIndex(-1);
        }
      } catch {
        // Silently fail — suggestions are non-critical
      }
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [phrase]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToPhrase(p: string) {
    router.push(`/go/${encodeURIComponent(p.trim())}`);
  }

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToPhrase(suggestions[activeIndex].phrase);
    } else {
      const trimmed = phrase.trim();
      if (!trimmed) return;
      goToPhrase(trimmed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <p className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        GoThere
      </p>
      <h1 className="mb-3 text-center text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
        Turn long, complicated links
        <br />
        into simple phrases.
      </h1>
      <p className="mb-14 max-w-lg text-center text-lg text-zinc-500 dark:text-zinc-400">
        Type the phrase. Go there.
      </p>

      {/* Card */}
      <div className="w-full max-w-2xl rounded-xl border border-zinc-200 p-6 shadow-md sm:p-8 dark:border-zinc-700">
        <div ref={containerRef} className="relative">
          <form onSubmit={handleGo} className="flex w-full gap-2">
            <input
              ref={inputRef}
              type="text"
              value={phrase}
              onChange={(e) => {
                setPhrase(e.target.value);
                setShowSuggestions(true);
                setNotFound(false);
              }}
              onFocus={() =>
                suggestions.length > 0 && setShowSuggestions(true)
              }
              onKeyDown={handleKeyDown}
              placeholder='Type a phrase, e.g. "Nike UK mens t-shirts"'
              autoFocus
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-lg outline-none transition-colors focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Go
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {suggestions.map((s, i) => (
                <li key={s.phrase}>
                  <button
                    type="button"
                    onClick={() => goToPhrase(s.phrase)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      i === activeIndex
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {s.phrase}
                    </span>
                    <span className="ml-2 truncate text-sm text-zinc-400 dark:text-zinc-500">
                      {s.url}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Not found state */}
        {notFound && queryPhrase && (
          <div className="mt-6 rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              No destination found
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              We couldn&apos;t find a phrase matching
              <br />
              &ldquo;
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {queryPhrase}
              </span>
              &rdquo;
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              It may not exist yet.
            </p>
            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setPhrase("");
                  setNotFound(false);
                  inputRef.current?.focus();
                }}
                className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Try another phrase
              </button>
              <Link
                href={`/create?phrase=${encodeURIComponent(queryPhrase)}`}
                className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Create this phrase
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CTAs below card */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <Link
          href="/create"
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Create a destination
        </Link>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Start now — you&apos;ll verify your email to publish.
        </p>
        <Link
          href="/login"
          className="text-sm text-zinc-400 underline hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Sign in to manage your destinations
        </Link>
      </div>

      {/* Trust row */}
      <p className="mt-10 text-xs tracking-wide text-zinc-400 dark:text-zinc-600">
        No ads · No student accounts required · Safety checks built-in
      </p>
    </div>
  );
}
