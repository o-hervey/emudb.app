'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { label: 'Browse',      href: '/browse' },
  { label: 'Lists',       href: '/lists' },
  { label: 'Categories',  href: '/categories' },
  { label: 'Systems',     href: '/systems' },
  { label: 'Contribute',  href: '/submit' },
];

export function Header() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    await refresh();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/emudb_horizontal_logo_light.png"
            alt="EmuDB"
            width={140}
            height={36}
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="/emudb_horizontal_logo_dark.png"
            alt="EmuDB"
            width={140}
            height={36}
            className="h-8 w-auto hidden dark:block"
            priority
          />
        </Link>

        {/* Primary nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent-surface)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <>
                  {user.isModerator && (
                    <Link
                      href="/moderation"
                      className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors"
                    >
                      Moderation
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
}
