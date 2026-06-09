'use client';

import { useAuth } from '@/components/AuthContext';
import { CategoryBadge } from '@/components/CategoryBadge';
import { SoftwareIcon } from '@/components/SoftwareIcon';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ListEntry {
  id: string;
  notes: string | null;
  sortOrder: number;
  software: {
    id: string;
    name: string;
    category: string;
    status: string;
  };
  hardware: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface ListDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  saveCount: number;
  cloneCount: number;
  viewerHasSaved: boolean;
  entries: ListEntry[];
}

function ListEntryRow({ entry }: { entry: ListEntry }) {
  return (
    <Link
      href={`/software/${entry.software.id}`}
      className="group flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="shrink-0 mt-0.5">
        <SoftwareIcon
          name={entry.software.name}
          category={entry.software.category}
          websiteUrl={null}
          size={40}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            {entry.software.name}
          </span>
          <CategoryBadge category={entry.software.category} />
          {entry.hardware && (
            <span className="text-xs bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] rounded-full px-2 py-0.5">
              {entry.hardware.name}
            </span>
          )}
        </div>
        {entry.notes && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
            {entry.notes}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [cloneSuccess, setCloneSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/lists/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: ListDetail) => {
        setList(data);
        setSaved(data.viewerHasSaved);
      })
      .catch((status) =>
        setError(status === 404 ? 'List not found.' : 'Failed to load list.')
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveToggle() {
    if (!user) {
      router.push(`/auth/signin?next=/lists/${id}`);
      return;
    }
    setSaveLoading(true);
    setActionError('');
    try {
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch(`/api/lists/${id}/save`, { method });
      if (res.ok) {
        const wasSaved = saved;
        setSaved(!wasSaved);
        setList((prev) =>
          prev ? { ...prev, saveCount: prev.saveCount + (wasSaved ? -1 : 1) } : prev
        );
      } else {
        const json = await res.json();
        setActionError(json.error ?? 'Failed to update save.');
      }
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleClone() {
    if (!user) {
      router.push(`/auth/signin?next=/lists/${id}`);
      return;
    }
    setCloneLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/lists/${id}/clone`, { method: 'POST' });
      if (res.ok) {
        setCloneSuccess(true);
      } else {
        const json = await res.json();
        setActionError(json.error ?? 'Failed to clone list.');
      }
    } finally {
      setCloneLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4 animate-pulse">
        <div className="h-4 w-24 rounded bg-[var(--color-surface)]" />
        <div className="h-8 w-2/3 rounded-lg bg-[var(--color-surface)]" />
        <div className="h-4 w-1/3 rounded bg-[var(--color-surface)]" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--color-surface)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <p className="text-[var(--color-text-muted)]">{error || 'List not found.'}</p>
        <Link
          href="/lists"
          className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Browse lists
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link
        href="/lists"
        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 mb-6"
      >
        ← Lists
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">{list.name}</h1>
        {list.description && (
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">
            {list.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
          <span>{list.entries.length} item{list.entries.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{list.saveCount} save{list.saveCount !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{list.cloneCount} clone{list.cloneCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions */}
      {user && (
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
              saved
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-surface)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]'
            }`}
          >
            {saveLoading ? '…' : saved ? '♥ Saved' : '♡ Save'}
          </button>

          {cloneSuccess ? (
            <Link
              href="/account?tab=lists"
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
            >
              Cloned → My Lists
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleClone}
              disabled={cloneLoading}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
            >
              {cloneLoading ? '…' : 'Clone to my lists'}
            </button>
          )}
        </div>
      )}

      {!user && (
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          <Link
            href={`/auth/signin?next=/lists/${id}`}
            className="text-[var(--color-accent)] hover:underline"
          >
            Sign in
          </Link>{' '}
          to save or clone this list.
        </p>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {actionError}
        </div>
      )}

      {/* Entries */}
      {list.entries.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">This list has no entries yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.entries.map((entry) => (
            <ListEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
