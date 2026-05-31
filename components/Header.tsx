'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export function Header() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    await refresh();
    router.push('/');
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-bold tracking-tight text-zinc-100 hover:text-white">
            EmuDB
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-400">
            <Link href="/browse" className="hover:text-zinc-100 transition-colors">Browse</Link>
            <Link href="/submit" className="hover:text-zinc-100 transition-colors">Submit</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {!loading && (
            user ? (
              <>
                {user.isModerator && (
                  <Link href="/moderation" className="text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 rounded hover:bg-zinc-800">
                    Moderation
                  </Link>
                )}
                <Link href="/tags/review" className="text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 rounded hover:bg-zinc-800">
                  Tag Review
                </Link>
                <span className="text-zinc-600 select-none">|</span>
                <span className="text-zinc-400 text-xs">{user.username ?? user.email}</span>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors text-xs"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="px-3 py-1.5 text-zinc-400 hover:text-zinc-100 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
                >
                  Sign up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
