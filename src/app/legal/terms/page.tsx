import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GoThere",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Terms of Service
      </h1>
      <p className="mb-8 text-sm text-zinc-400 dark:text-zinc-500">
        Last updated: February 2025
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. About GoThere
          </h2>
          <p>
            GoThere is a destination engine operated by GoThere (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;, &ldquo;our&rdquo;). It allows users to assign a
            human-readable phrase to a web address (URL), so others can type the
            phrase and be redirected to that URL.
          </p>
          <p className="mt-2">
            The Service is currently provided at gothere.cc.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Acceptance
          </h2>
          <p>By using GoThere, you agree to these Terms.</p>
          <p className="mt-2">
            If you are using GoThere on behalf of an organisation (such as a
            school or business), you confirm that you have authority to bind that
            organisation.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Accounts
          </h2>
          <p>
            To create destinations, you must sign in using a valid email address
            via passwordless authentication (magic link).
          </p>
          <p className="mt-2">
            You are responsible for maintaining access to your email address and
            for activity under your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Creating Destinations
          </h2>
          <p>When you create a destination, you represent that:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>The URL is not malicious, deceptive, or harmful.</li>
            <li>
              You are not impersonating a person, brand, or organisation.
            </li>
            <li>The content is lawful under applicable law.</li>
          </ul>
          <p className="mt-2">
            We may apply automated safety checks to submitted URLs. We may
            block, quarantine, suspend, or remove destinations at our
            discretion.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Phrase Assignment
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Phrases are assigned on a first-come, first-served basis.
            </li>
            <li>
              Creating a destination does not grant ownership or proprietary
              rights in a phrase.
            </li>
            <li>
              We may reclaim, reassign, suspend, or remove any phrase at our
              discretion, including in cases of impersonation, bad faith,
              misuse, or inactivity.
            </li>
          </ul>
          <p className="mt-2">
            We may introduce reserved or verified phrases in the future.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            6. Acceptable Use
          </h2>
          <p>You must not use GoThere to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Direct users to malicious or phishing content.</li>
            <li>Distribute malware.</li>
            <li>Impersonate any person or organisation.</li>
            <li>Register phrases in bad faith or for resale.</li>
            <li>Interfere with the Service.</li>
          </ul>
          <p className="mt-2">
            We may suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            7. Redirects and External Content
          </h2>
          <p>
            GoThere is a redirect service. We do not host or control the content
            at destination URLs. Users follow redirects at their own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            8. Availability
          </h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;. We do not guarantee:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Continuous availability,</li>
            <li>That any phrase will remain assigned,</li>
            <li>That redirects will always function.</li>
          </ul>
          <p className="mt-2">
            GoThere is not intended for emergency, safety-critical, or
            mission-critical use.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            9. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, we are not liable for
            indirect or consequential loss arising from use of the Service or
            any destination URL.
          </p>
          <p className="mt-2">
            Our total liability shall not exceed &pound;100.
          </p>
          <p className="mt-2">
            Nothing in these Terms limits liability that cannot be excluded
            under the laws of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            10. Changes
          </h2>
          <p>
            We may update these Terms from time to time. Continued use
            constitutes acceptance of any updates.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            11. Governing Law
          </h2>
          <p>
            These Terms are governed by the laws of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            12. Contact
          </h2>
          <p>
            GoThere
            <br />
            <a
              href="mailto:admin@gothere.cc"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              admin@gothere.cc
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
