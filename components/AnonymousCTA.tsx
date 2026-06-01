import Image from 'next/image';
import Link from 'next/link';

export function AnonymousCTA() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-accent-surface)] p-4 text-center">
      <Image
        src="/logo.png"
        alt=""
        width={48}
        height={48}
        className="mx-auto mb-3 rounded-full"
      />
      <p className="text-sm font-semibold text-[var(--color-text)] mb-1">Welcome to EmuDB</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-4 leading-relaxed">
        Sign up to submit listings, rate software, and help build the directory.
      </p>
      <Link
        href="/auth/signup"
        className="block w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors text-center"
      >
        Create account
      </Link>
      <Link
        href="/auth/signin"
        className="block mt-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
      >
        Already have an account? Sign in
      </Link>
    </div>
  );
}
