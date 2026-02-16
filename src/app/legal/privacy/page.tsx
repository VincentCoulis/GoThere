import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GoThere",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-zinc-400 dark:text-zinc-500">
        Last updated: February 2025
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Who We Are
          </h2>
          <p>
            GoThere is operated by GoThere, based in the United Kingdom.
          </p>
          <p className="mt-2">
            Contact:{" "}
            <a
              href="mailto:admin@gothere.cc"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              admin@gothere.cc
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. What Data We Collect
          </h2>
          <p>We collect:</p>
          <h3 className="mt-3 font-medium text-zinc-800 dark:text-zinc-200">
            Account Data
          </h3>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>Email address (for authentication via magic link)</li>
          </ul>
          <h3 className="mt-3 font-medium text-zinc-800 dark:text-zinc-200">
            Usage Data
          </h3>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>Phrases created</li>
            <li>Destination URLs</li>
            <li>Click counts</li>
            <li>Basic technical logs (such as IP address and browser data)</li>
          </ul>
          <p className="mt-2">
            We do not require accounts from people who use phrases to access
            destinations.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. How We Use Your Data
          </h2>
          <p>We use your data to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Authenticate your account</li>
            <li>Operate the redirect service</li>
            <li>Prevent abuse and malicious activity</li>
            <li>Improve the Service</li>
          </ul>
          <p className="mt-2">We do not sell personal data.</p>
          <p>We do not use personal data for advertising.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Legal Basis (UK GDPR)
          </h2>
          <p>We process personal data on the basis of:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Legitimate interests (operating and securing the Service)
            </li>
            <li>Contract (providing the Service to account holders)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Data Storage
          </h2>
          <p>Data is stored using Supabase (cloud infrastructure).</p>
          <p className="mt-2">
            Data may be stored in secure data centres outside the UK with
            appropriate safeguards.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            6. Retention
          </h2>
          <p>
            We retain account and destination data while your account is active.
          </p>
          <p className="mt-2">
            You may request deletion of your account at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            7. Your Rights
          </h2>
          <p>Under UK GDPR, you have the right to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Access your data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion</li>
            <li>Object to processing</li>
            <li>Lodge a complaint with the ICO</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact:{" "}
            <a
              href="mailto:admin@gothere.cc"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              admin@gothere.cc
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            8. Children
          </h2>
          <p>GoThere does not require accounts from students.</p>
          <p className="mt-2">
            We do not knowingly collect personal data from children.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            9. Changes
          </h2>
          <p>
            We may update this policy. Continued use constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
