'use client';

import { useAuth } from '@/components/AuthContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountSettingsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin?next=/account/settings');
    if (user) setUsername(user.username ?? '');
  }, [loading, user, router]);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess(false);
    setUsernameLoading(true);
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok) { setUsernameError(json.error ?? 'Failed to update username'); return; }
      setUsernameSuccess(true);
      await refresh();
    } catch {
      setUsernameError('Something went wrong.');
    } finally {
      setUsernameLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setPasswordError(error.message); return; }
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleCloseAccount() {
    if (!confirm(
      'Close your account? This will deactivate your profile and remove your username. ' +
      'Your submissions and ratings will remain for data integrity. This cannot be undone.'
    )) return;
    setCloseError('');
    setCloseLoading(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) { setCloseError('Failed to close account. Please try again.'); return; }
      await refresh();
      router.push('/');
    } catch {
      setCloseError('Something went wrong.');
    } finally {
      setCloseLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-[var(--color-surface)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/account"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          ← Account
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Username */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Username</h2>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            {usernameError && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {usernameError}
              </div>
            )}
            {usernameSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                Username updated.
              </div>
            )}
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setUsernameSuccess(false); }}
                placeholder="username"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                3–30 characters. Letters, numbers, _ and - only.
              </p>
            </div>
            <button
              type="submit"
              disabled={usernameLoading || !username.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              {usernameLoading ? 'Saving…' : 'Update username'}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                Password updated.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        {/* Close account */}
        <section className="rounded-xl border border-red-200 dark:border-red-800 bg-[var(--color-surface)] p-6">
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">
            Close account
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Deactivates your profile and removes your username. Your submissions and ratings remain
            for data integrity. This cannot be undone.
          </p>
          {closeError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {closeError}
            </div>
          )}
          <button
            type="button"
            onClick={handleCloseAccount}
            disabled={closeLoading}
            className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
          >
            {closeLoading ? 'Closing…' : 'Close account'}
          </button>
        </section>
      </div>
    </div>
  );
}
