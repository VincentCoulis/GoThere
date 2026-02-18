import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 pb-10 pt-6 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div>&copy; {new Date().getFullYear()} GoThere</div>
        <div className="flex gap-6">
          <Link
            href="/legal/terms"
            className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Terms
          </Link>
          <Link
            href="/legal/privacy"
            className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Privacy
          </Link>
          <a
            href="mailto:admin@gothere.to"
            className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
