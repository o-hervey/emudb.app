'use client';

import { useAuth } from '@/components/AuthContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type OAuthProvider = 'github' | 'discord';

type LinkedIdentity = {
  id?: string;
  identity_id?: string;
  provider: string;
  provider_id?: string;
  email?: string;
  identity_data?: {
    email?: string;
    name?: string;
    full_name?: string;
    user_name?: string;
    preferred_username?: string;
    avatar_url?: string;
  };
};

const PROVIDERS: Array<{
  provider: OAuthProvider;
  label: string;
}> = [
  { provider: 'github', label: 'GitHub' },
  { provider: 'discord', label: 'Discord' },
];

function ProviderIcon({ provider }: { provider: OAuthProvider }) {
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

function identityDisplayName(identity: LinkedIdentity) {
  const data = identity.identity_data ?? {};

  return (
    data.user_name ??
    data.preferred_username ??
    data.full_name ??
    data.name ??
    data.email ??
    identity.email ??
    identity.provider
  );
}

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

  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);
  const [identityAction, setIdentityAction] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState('');
  const [identitySuccess, setIdentitySuccess] = useState('');

  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState('');

  const linkedProviderSet = useMemo(
    () => new Set(identities.map((identity) => identity.provider)),
    [identities]
  );

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin?next=/account/settings');
    if (user) setUsername(user.username ?? '');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    void fetchIdentities();
  }, [user]);

  async function fetchIdentities() {
    setIdentitiesLoading(true);
    setIdentityError('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUserIdentities();

      if (error) {
        setIdentityError(error.message);
        return;
      }

      setIdentities((data?.identities ?? []) as LinkedIdentity[]);
    } catch {
      setIdentityError('Failed to load connected accounts.');
    } finally {
      setIdentitiesLoading(false);
    }
  }

  async function handleLinkIdentity(provider: OAuthProvider) {
    setIdentityError('');
    setIdentitySuccess('');
    setIdentityAction(provider);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/account/settings')}`,
        },
      });

      if (error) {
        setIdentityError(error.message);
        setIdentityAction(null);
      }
    } catch {
      setIdentityError('Something went wrong while starting account linking.');
      setIdentityAction(null);
    }
  }

  async function handleUnlinkIdentity(identity: LinkedIdentity) {
    const providerLabel = identity.provider.charAt(0).toUpperCase() + identity.provider.slice(1);

    if (!confirm(`Disconnect ${providerLabel} from your account?`)) return;

    setIdentityError('');
    setIdentitySuccess('');
    setIdentityAction(identity.provider);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.unlinkIdentity(identity);

      if (error) {
        setIdentityError(error.message);
        return;
      }

      setIdentitySuccess(`${providerLabel} disconnected.`);
      await fetchIdentities();
      await refresh();
    } catch {
      setIdentityError('Something went wrong while disconnecting the account.');
    } finally {
      setIdentityAction(null);
    }
  }

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

      if (!res.ok) {
        setUsernameError(json.error ?? 'Failed to update username');
        return;
      }

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

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      await fetchIdentities();
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

      if (!res.ok) {
        setCloseError('Failed to close account. Please try again.');
        return;
      }

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
        {Array.from({ length: 4 }).map((_, i) => (
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameSuccess(false);
                }}
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

        {/* Connected accounts */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Connected accounts</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Link GitHub or Discord so you can sign in with either provider.
            </p>
          </div>

          {identityError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {identityError}
            </div>
          )}

          {identitySuccess && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              {identitySuccess}
            </div>
          )}

          {identitiesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-[var(--color-bg)] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {PROVIDERS.map(({ provider, label }) => {
                const linkedIdentity = identities.find((identity) => identity.provider === provider);
                const isLinked = linkedProviderSet.has(provider);
                const actioning = identityAction === provider;

                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                        <ProviderIcon provider={provider} />
                        {label}
                      </div>

                      <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                        {isLinked && linkedIdentity
                          ? `Connected as ${identityDisplayName(linkedIdentity)}`
                          : 'Not connected'}
                      </p>
                    </div>

                    {isLinked && linkedIdentity ? (
                      <button
                        type="button"
                        onClick={() => handleUnlinkIdentity(linkedIdentity)}
                        disabled={actioning || identities.length < 2}
                        title={identities.length < 2 ? 'You need at least one other sign-in method before disconnecting this provider.' : undefined}
                        className="shrink-0 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors"
                      >
                        {actioning ? 'Disconnecting…' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLinkIdentity(provider)}
                        disabled={actioning}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-xs font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
                      >
                        {actioning ? 'Connecting…' : 'Connect'}
                      </button>
                    )}
                  </div>
                );
              })}

              <p className="text-xs text-[var(--color-text-muted)]">
                You must keep at least one sign-in method connected to your account.
              </p>
            </div>
          )}
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