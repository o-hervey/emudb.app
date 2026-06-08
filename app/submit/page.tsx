'use client';

import { useAuth } from '@/components/AuthContext';
import { useFilters } from '@/components/FiltersContext';
import { HardwareMultiSelect } from '@/components/HardwareMultiSelect';
import { MultiSelect } from '@/components/MultiSelect';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'COMPANION_APP',       label: 'Companion App' },
  { value: 'COMPATIBILITY_LAYER', label: 'Compatibility Layer' },
  { value: 'EMULATOR',            label: 'Emulator' },
  { value: 'FRONTEND',            label: 'Frontend' },
  { value: 'GAME_STATE_TOOL',     label: 'Game State Tool' },
  { value: 'INPUT_CONTROLLERS',   label: 'Input & Controllers' },
  { value: 'MEDIA_SCRAPER',       label: 'Media Scraper' },
  { value: 'NETPLAY',             label: 'Netplay' },
  { value: 'OPERATING_SYSTEM',    label: 'OS & CFW' },
  { value: 'ROM_MANAGER',         label: 'ROM Manager' },
  { value: 'SHADER',              label: 'Shader' },
  { value: 'STREAMING',           label: 'Streaming' },
  { value: 'UTILITY',             label: 'Utility' },
];

const STATUSES = [
  { value: 'ACTIVE',     label: 'Active' },
  { value: 'ABANDONED',  label: 'Abandoned' },
  { value: 'DEPRECATED', label: 'Deprecated' },
];

const inputCls =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
        {label}
        {hint && <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

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
    return <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-[var(--color-text-muted)]">Loading…</div>;
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 p-8">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">Submission received</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Your listing is pending moderator review. Once approved it will appear in the directory.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName(''); setDescription(''); setCategory('');
                setStatus('ACTIVE');
                setWebsiteUrl(''); setDownloadUrl(''); setSourceUrl('');
                setSystemIds([]); setPlatformIds([]); setHardwareIds([]);
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors"
            >
              Submit another
            </button>
            <Link
              href="/browse"
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Browse directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Submit a listing</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
        Submissions are reviewed before going live. Please link only to official project pages, GitHub/GitLab repositories, or recognised distribution platforms.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" hint="(required)">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PCSX2" className={inputCls} />
          </Field>
          <Field label="Category" hint="(required)">
            <select aria-label="Category" required value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
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
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>

        <div className="space-y-4 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Compatibility</p>
          <MultiSelect label="Platforms" options={filters?.platforms ?? []} selected={platformIds} onChange={setPlatformIds} />
          <MultiSelect label="Systems"   options={filters?.systems ?? []}   selected={systemIds}   onChange={setSystemIds} />
          <HardwareMultiSelect label="Hardware" options={filters?.hardware ?? []} selected={hardwareIds} onChange={setHardwareIds} />
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={submitting || !name || !category}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </div>
  );
}
