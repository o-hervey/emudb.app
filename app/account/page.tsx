'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

interface UserList {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
  saveCount: number;
  cloneCount: number;
}

interface SavedList {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  savedAt: string;
  entryCount: number;
  saveCount: number;
  cloneCount: number;
}

function ListFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  submitting,
}: {
  title: string;
  initial?: { name: string; description: string; isPublic: boolean };
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; isPublic: boolean }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description, isPublic });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My setup, favourites…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Description{' '}
              <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list for?"
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-text)]">Make this list public</span>
          </label>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyListCard({
  list,
  onEdit,
  onDelete,
}: {
  list: UserList;
  onEdit: (list: UserList) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/lists/${list.id}`}
            className="font-medium text-[var(--color-text)] text-sm truncate block hover:text-[var(--color-accent)] transition-colors"
          >
            {list.name}
          </Link>
          {list.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
              {list.description}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            list.isPublic
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
          }`}
        >
          {list.isPublic ? 'Public' : 'Private'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span>{list.entryCount} item{list.entryCount !== 1 ? 's' : ''}</span>
        {list.isPublic && (
          <>
            <span>·</span>
            <span>{list.saveCount} save{list.saveCount !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{list.cloneCount} clone{list.cloneCount !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => onEdit(list)}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(list.id)}
          className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function SavedListCard({
  list,
  onUnsave,
}: {
  list: SavedList;
  onUnsave: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
      <div className="min-w-0">
        <h3 className="font-medium text-[var(--color-text)] text-sm truncate">{list.name}</h3>
        {list.description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
            {list.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span>{list.entryCount} item{list.entryCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{list.saveCount} save{list.saveCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{list.cloneCount} clone{list.cloneCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
        <Link
          href={`/lists/${list.id}`}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          View
        </Link>
        <button
          type="button"
          onClick={() => onUnsave(list.id)}
          className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors ml-auto"
        >
          Unsave
        </button>
      </div>
    </div>
  );
}

function AccountContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'lists';

  const [myLists, setMyLists] = useState<UserList[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [listsFetched, setListsFetched] = useState(false);
  const [savedFetched, setSavedFetched] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editingList, setEditingList] = useState<UserList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?next=/account');
    }
  }, [loading, user, router]);

  const fetchMyLists = useCallback(async () => {
    try {
      const res = await fetch('/api/account/lists');
      if (res.ok) setMyLists(await res.json());
    } catch {
      // network error — lists stay empty, user can retry by switching tabs
    } finally {
      setListsFetched(true);
    }
  }, []);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch('/api/account/saved');
      if (res.ok) setSavedLists(await res.json());
    } catch {
      // network error — saved lists stay empty
    } finally {
      setSavedFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (tab === 'lists' && !listsFetched) fetchMyLists();
    if (tab === 'saved' && !savedFetched) fetchSaved();
  }, [user, tab, listsFetched, savedFetched, fetchMyLists, fetchSaved]);

  async function handleCreate(data: { name: string; description: string; isPublic: boolean }) {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? 'Failed to create list');
        return;
      }
      setShowCreate(false);
      setListsFetched(false);
      await fetchMyLists();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(data: { name: string; description: string; isPublic: boolean }) {
    if (!editingList) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/lists/${editingList.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? 'Failed to update list');
        return;
      }
      setEditingList(null);
      setListsFetched(false);
      await fetchMyLists();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this list? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMyLists((prev) => prev.filter((l) => l.id !== id));
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Failed to delete list.');
      }
    } catch {
      setError('Failed to delete list. Please try again.');
    }
  }

  async function handleUnsave(listId: string) {
    try {
      const res = await fetch(`/api/lists/${listId}/save`, { method: 'DELETE' });
      if (res.ok) {
        setSavedLists((prev) => prev.filter((l) => l.id !== listId));
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Failed to unsave list.');
      }
    } catch {
      setError('Failed to unsave list. Please try again.');
    }
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="h-8 w-32 rounded-lg bg-[var(--color-surface)] animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'lists', label: 'My Lists' },
    { key: 'saved', label: 'Saved Lists' },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Account</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{user.username ?? user.email}</p>
        </div>
        <Link
          href="/account/settings"
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] transition-colors"
        >
          Settings
        </Link>
      </div>

      <div className="flex items-center gap-1 border-b border-[var(--color-border)] mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => router.push(`/account?tab=${key}`)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {tab === 'lists' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">My Lists</h2>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              New list
            </button>
          </div>
          {!listsFetched ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-[var(--color-surface)] animate-pulse" />
              ))}
            </div>
          ) : myLists.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[var(--color-text-muted)] text-sm">No lists yet.</p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-3 text-sm text-[var(--color-accent)] hover:underline"
              >
                Create your first list
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLists.map((list) => (
                <MyListCard
                  key={list.id}
                  list={list}
                  onEdit={setEditingList}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Saved Lists</h2>
          {!savedFetched ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-[var(--color-surface)] animate-pulse" />
              ))}
            </div>
          ) : savedLists.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[var(--color-text-muted)] text-sm">No saved lists yet.</p>
              <Link
                href="/lists"
                className="mt-3 text-sm text-[var(--color-accent)] hover:underline inline-block"
              >
                Browse public lists
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLists.map((list) => (
                <SavedListCard key={list.id} list={list} onUnsave={handleUnsave} />
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <ListFormModal
          title="Create list"
          onClose={() => { setShowCreate(false); setError(''); }}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}
      {editingList && (
        <ListFormModal
          title="Edit list"
          initial={{
            name: editingList.name,
            description: editingList.description ?? '',
            isPublic: editingList.isPublic,
          }}
          onClose={() => { setEditingList(null); setError(''); }}
          onSubmit={handleEdit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-[var(--color-text-muted)]">Loading…</div>
    }>
      <AccountContent />
    </Suspense>
  );
}
