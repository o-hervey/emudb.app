import Image from 'next/image';
import Link from 'next/link';

const NAV_COLUMNS = [
  {
    heading: 'Directory',
    links: [
      { label: 'Browse', href: '/browse' },
      { label: 'Categories', href: '/categories' },
      { label: 'Systems', href: '/systems' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Submit a listing', href: '/submit' },
      { label: 'About', href: '/about' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row gap-10 justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="inline-block">
              <Image
                src="/emudb_horizontal_logo_light.png"
                alt="EmuDB"
                width={160}
                height={40}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/emudb_horizontal_logo_dark.png"
                alt="EmuDB"
                width={160}
                height={40}
                className="h-8 w-auto hidden dark:block"
              />
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              A community-driven directory of emulation software.
            </p>
            <a
              href="https://github.com/o-hervey/emudb.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>

          {/* Nav columns */}
          <div className="flex gap-12">
            {NAV_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  {col.heading}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <span>© {new Date().getFullYear()} EmuDB</span>
          <span>MIT Licence</span>
        </div>
      </div>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
