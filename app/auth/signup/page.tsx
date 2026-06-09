'use client';

import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';

  try {
    const url = new URL(next, 'https://emudb.local');
    if (url.origin !== 'https://emudb.local') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

function AuthInput({
  label,
  type,
  value,
  onChange,
  required,
  minLength,
  placeholder,
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
      />
      {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

function ProviderIcon({ provider }: { provider: 'github' | 'discord' }) {
  if (provider === 'github') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21A105.73 105.73 0 0 0 32.71 96.36a77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5.06-12.74 11.43-12.74S54 46 53.89 53 48.84 65.69 42.45 65.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5.06-12.74 11.44-12.74S96.23 46 96.12 53s-5.06 12.69-11.43 12.69Z" />
    </svg>
  );
}

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));

  async function signInWithProvider(provider: 'github' | 'discord') {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: username.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Sign up failed');
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-[var(--color-text)]">
          A confirmation link has been sent to <strong>{email}</strong>.
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Check your inbox and click the link to activate your account. Check your spam folder if it doesn&apos;t arrive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => signInWithProvider('github')}
          disabled={loading}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 px-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
        >
          <ProviderIcon provider="github" />
          Continue with GitHub
        </button>

        <button
          type="button"
          onClick={() => signInWithProvider('discord')}
          disabled={loading}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 px-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
        >
          <ProviderIcon provider="discord" />
          Continue with Discord
        </button>
      </div>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--color-surface)] px-2 text-xs text-[var(--color-text-muted)]">
            or use email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} required />

        <AuthInput
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          placeholder="Optional"
          hint="3–30 characters. Letters, numbers, underscores."
        />

        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={8}
          hint="At least 8 characters."
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="EmuDB" width={64} height={64} className="mx-auto mb-4 rounded-full" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Create an account</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Free. No spam.</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <Suspense>
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}