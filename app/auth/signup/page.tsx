'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
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
      if (!res.ok) { setError(data.error ?? 'Sign up failed'); return; }
      await refresh();
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-bold text-zinc-100 mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Username <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="3–30 chars, letters/numbers/underscores"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
