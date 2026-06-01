import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">

      {/* Hero — emu mark + tagline */}
      <div className="text-center mb-16">
        <Image
          src="/logo.png"
          alt="The EmuDB emu"
          width={220}
          height={220}
          className="mx-auto mb-8 drop-shadow-lg"
          priority
        />
        <p className="text-2xl font-bold text-[var(--color-text)] leading-snug">
          A community-driven directory of emulation software.
        </p>
      </div>

      {/* Section: What is EmuDB? */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">What is EmuDB?</h2>
        <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
          <p>
            You know the drill. You pick up a new handheld, or finally get around to setting up a front-end,
            or want to know if a particular emulator has improved recently — and you spend an hour
            piecing together an answer from a three-year-old Reddit thread, a YouTube video that
            buries the point, and a Discord server where the question was already asked but never
            really answered.
          </p>
          <p>
            EmuDB exists to short-circuit that. It{"'"}s a single place to look up emulation software —
            emulators, frontends, operating systems, utilities, scrapers, shaders — filter by the system
            you{"'"}re targeting or the hardware you{"'"}re running it on, and go straight to the official
            source. No guides, no ROMs, no noise.
          </p>
          <p>
            The part that makes it actually useful over time is the rating system. There are two scores:
            one for overall software quality, one for performance on specific hardware. So if you{"'"}re
            running a Steam Deck or a particular Android device, you can see how something performs
            on that exact setup — not just whether it{"'"}s generally well-regarded. The more people
            rate and review, the more accurate and useful that picture becomes.
          </p>
        </div>
      </section>

      {/* Section: How to contribute */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">How to contribute</h2>
        <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
          <p>
            Contributions happen on the site itself.
          </p>
          <p>
            If software is missing from the directory, submit it. If you{"'"}ve used something and have an
            opinion, rate it — especially if you can attach a hardware-specific performance score. If a tag
            would make something easier to find, add it.
          </p>
          <p>
            Submitted listings go through a moderation queue before they go live, so quality stays high
            without requiring accounts to be vetted upfront. Anyone with at least one approved submission
            can review pending tags.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            Submit a listing →
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            Browse the directory →
          </Link>
        </div>
      </section>

      {/* Section: Open source */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Open source</h2>
        <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
          <p>
            EmuDB is open source under the MIT licence. The full codebase is on GitHub. Pull requests,
            bug reports, and feature suggestions are welcome — especially from anyone familiar with
            Next.js, Prisma, or Supabase.
          </p>
          <p>
            At the time of writing, the project is maintained by one person. Any help is genuinely appreciated.
          </p>
        </div>
        <div className="mt-6">
          <a
            href="https://github.com/o-hervey/emudb.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <GitHubIcon />
            View on GitHub
          </a>
        </div>
      </section>

      {/* Closing line — must be the last element */}
      <p className="text-xs text-[var(--color-text-muted)] text-center">
        It is not a database of emus.
      </p>

    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
