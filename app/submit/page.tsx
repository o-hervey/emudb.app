'use client';

import { useAuth } from '@/components/AuthContext';
import { useFilters } from '@/components/FiltersContext';
import { MultiSelect } from '@/components/MultiSelect';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'EMULATOR', label: 'Emulator' },
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'OPERATING_SYSTEM', label: 'Operating System' },
  { value: 'COMPATIBILITY_LAYER', label: 'Compatibility Layer' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'SCRAPER', label: 'Scraper' },
  { value: 'SHADER', label: 'Shader' },
  { value: 'COMPANION_APP', label: 'Companion App' },
  { value: 'INPUT_CONTROLLERS', label: 'Input Controllers' },
  { value: 'STREAMING', label: 'Streaming' },
];

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'DEPRECATED', label: 'Deprecated' },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
        {label}
        {hint && <span className="ml-1.5 font-normal text-zinc-500">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors';

export default function SubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const { filters } = useFilters();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [systemIds, setSystemIds] = useState<string[]>([]);
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [hardwareIds, setHardwareIds] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?next=/submit');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-zinc-400 text-sm">Loading…</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_LISTING',
          name,
          description: description.trim() || undefined,
          category,
          status,
          websiteUrl: websiteUrl.trim() || undefined,
          downloadUrl: downloadUrl.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
          systemIds,
          platformIds,
          hardwareIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Submission failed'); return; }
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-lg border border-green-800 bg-green-900/20 p-8">
          <h2 className="text-lg font-semibold text-green-300 mb-2">Submission received</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Your listing is pending moderator review. Once approved it will appear in the directory.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => { setSubmitted(false); setName(''); setDescription(''); setCategory(''); setSystemIds([]); setPlatformIds([]); setHardwareIds([]); }}
              className="px-4 py-2 rounded border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              Submit another
            </button>
            <Link href="/browse" className="px-4 py-2 rounded bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
              Browse directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Submit a listing</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Submissions are reviewed before going live. Include links to the official project pages.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" hint="(required)">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PCSX2"
              className={inputCls}
            />
          </Field>
          <Field label="Category" hint="(required)">
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Description" hint="(optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of the software and what it does…"
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Website URL" hint="(optional)">
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
          <Field label="Download URL" hint="(optional)">
            <input type="url" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
          <Field label="Source URL" hint="(optional)">
            <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://github.com/…" className={inputCls} />
          </Field>
        </div>

        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>

        <div className="space-y-4 border-t border-zinc-800 pt-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Compatibility</p>
          <MultiSelect
            label="Platforms"
            options={filters?.platforms ?? []}
            selected={platformIds}
            onChange={setPlatformIds}
          />
          <MultiSelect
            label="Systems"
            options={filters?.systems ?? []}
            selected={systemIds}
            onChange={setSystemIds}
          />
          <MultiSelect
            label="Hardware"
            options={filters?.hardware ?? []}
            selected={hardwareIds}
            onChange={setHardwareIds}
          />
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={submitting || !name || !category}
            className="px-6 py-2.5 rounded bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </div>
  );
}
