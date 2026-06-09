'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type Tab = 'overview' | 'users' | 'seed' | 'reports';

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'users',    label: 'Users' },
  { value: 'seed',     label: 'Seed Data' },
  { value: 'reports',  label: 'Reports' },
];

// ─── shared helpers ───────────────────────────────────────────────────────────

function input(extra = '') {
  return `w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] ${extra}`;
}

async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json as T;
}

function Btn({
  children, onClick, disabled, variant = 'ghost', type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
}) {
  const base = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40';
  const styles = {
    primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
    ghost:   'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]',
    danger:  'border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-3 mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40 transition-colors">Previous</button>
      <span className="text-sm text-[var(--color-text-muted)]">Page {page} of {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40 transition-colors">Next</button>
    </div>
  );
}

function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        {cols.map((c, i) => (
          <th key={i} className={`px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase ${i === cols.length - 1 ? 'text-right' : 'text-left'}`}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

interface Stats {
  totalUsers: number; newUsersLast30: number; newUsersLast7: number;
  totalApprovedListings: number; newListingsLast7: number;
  totalRatings: number; ratingsLast7: number;
  pendingModerationCount: number; pendingTagCount: number;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">{value.toLocaleString()}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => readJson<Stats>(r))
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>;
  if (!stats) return <p className="text-sm text-red-500">Failed to load stats.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} />
      <StatCard label="New Users (30d)" value={stats.newUsersLast30} />
      <StatCard label="New Users (7d)" value={stats.newUsersLast7} />
      <StatCard label="Approved Listings" value={stats.totalApprovedListings} />
      <StatCard label="Submissions (7d)" value={stats.newListingsLast7} sub="NEW_LISTING type" />
      <StatCard label="Total Ratings" value={stats.totalRatings} />
      <StatCard label="New Ratings (7d)" value={stats.ratingsLast7} />
      <StatCard label="Pending Queue" value={stats.pendingModerationCount} />
      <StatCard label="Pending Tags" value={stats.pendingTagCount} />
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string; username: string | null; email: string; createdAt: string;
  isModerator: boolean; isSuperAdmin: boolean; complaintScore: number; isActive: boolean;
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams({ page: String(page) });
    if (search) p.set('search', search);
    fetch(`/api/admin/users?${p}`)
      .then((r) => readJson<{ data?: AdminUser[]; meta?: typeof meta }>(r))
      .then(json => {
        setUsers(json.data ?? []);
        setMeta(json.meta ?? { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err: Error) => setError(err.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function patchUser(id: string, data: Partial<{ isModerator: boolean; isActive: boolean }>) {
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Action failed'); return; }
      fetchUsers();
    } finally { setActioning(null); }
  }

  async function banUser(id: string, username: string | null) {
    if (!confirm(`Permanently ban ${username ?? id}? This clears their username and freezes the account.`)) return;
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Action failed'); return; }
      fetchUsers();
    } finally { setActioning(null); }
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search by username or email…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className={input('max-w-sm')}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="min-w-full text-sm">
          <TableHead cols={['User', 'Joined', 'Roles', 'Score', 'Status', 'Actions']} />
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 rounded bg-[var(--color-surface-raised)] animate-pulse" /></td></tr>
                ))
              : users.length === 0
              ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No users found.</td></tr>
              : users.map(u => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--color-text)]">
                        {u.username ?? <span className="italic text-[var(--color-text-muted)]">banned</span>}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {u.isSuperAdmin && <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 text-xs font-medium">Super</span>}
                        {u.isModerator && <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs font-medium">Mod</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{u.complaintScore.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs">
                      {u.isActive
                        ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                        : <span className="text-red-500 font-medium">Frozen</span>}
                    </td>
                    <td className="px-4 py-3">
                      {!u.isSuperAdmin && (
                        <div className="flex gap-1.5 justify-end">
                          <Btn disabled={actioning === u.id} onClick={() => patchUser(u.id, { isModerator: !u.isModerator })}>
                            {u.isModerator ? 'Revoke Mod' : 'Grant Mod'}
                          </Btn>
                          <Btn disabled={actioning === u.id} onClick={() => patchUser(u.id, { isActive: !u.isActive })}>
                            {u.isActive ? 'Freeze' : 'Unfreeze'}
                          </Btn>
                          <Btn variant="danger" disabled={actioning === u.id || u.username === null} onClick={() => banUser(u.id, u.username)}>
                            Ban
                          </Btn>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">{meta.total} total users</p>
      <Pagination page={page} totalPages={meta.totalPages} onChange={p => setPage(p)} />
    </div>
  );
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SYSTEM_TYPES  = ['HOME', 'HANDHELD', 'ARCADE', 'COMPUTER', 'OTHER'];
const PLATFORM_GROUPS = ['WINDOWS', 'MACOS', 'LINUX', 'MOBILE', 'CONSOLE', 'OTHER'];
const HARDWARE_TYPES  = ['HANDHELD', 'SBC', 'MODDED_CONSOLE', 'DESKTOP_ARCHITECTURE', 'FPGA'];

interface DbSystem   { id: string; name: string; manufacturer: string | null; type: string }
interface DbPlatform { id: string; name: string; group: string }
interface DbHardware { id: string; name: string; manufacturer: string | null; type: string; primaryPlatformId: string | null; primaryPlatform: { id: string; name: string } | null }

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SystemsSection() {
  const [items, setItems] = useState<DbSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', manufacturer: '', type: 'HOME' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const reload = () => {
    setLoading(true);
    fetch('/api/admin/systems')
      .then((r) => readJson<DbSystem[]>(r))
      .then(setItems)
      .catch(() => setFormError('Failed to load systems.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  function startEdit(item: DbSystem) {
    setShowAdd(false); setEditingId(item.id);
    setForm({ name: item.name, manufacturer: item.manufacturer ?? '', type: item.type });
    setFormError('');
  }
  function startAdd() {
    setEditingId(null); setShowAdd(true);
    setForm({ name: '', manufacturer: '', type: 'HOME' }); setFormError('');
  }
  function cancel() { setEditingId(null); setShowAdd(false); setFormError(''); }

  async function save() {
    setSaving(true); setFormError('');
    try {
      const body = { name: form.name, manufacturer: form.manufacturer || null, type: form.type };
      const url = editingId ? `/api/admin/systems/${editingId}` : '/api/admin/systems';
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? 'Save failed'); return; }
      cancel(); reload();
    } finally { setSaving(false); }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete system "${name}"?`)) return;
    const res = await fetch(`/api/admin/systems/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Delete failed'); return; }
    reload();
  }

  const showForm = showAdd || editingId !== null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--color-text)]">Systems</h3>
        {!showForm && <Btn variant="primary" onClick={startAdd}>Add New</Btn>}
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] p-4 space-y-3">
          <p className="text-sm font-medium text-[var(--color-text)]">{editingId ? 'Edit System' : 'New System'}</p>
          <FieldRow label="Name"><input className={input()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FieldRow>
          <FieldRow label="Manufacturer"><input className={input()} value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="Optional" /></FieldRow>
          <FieldRow label="Type">
            <select className={input()} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FieldRow>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
            <Btn onClick={cancel}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading…</p> : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-sm">
            <TableHead cols={['Name', 'Manufacturer', 'Type', 'Actions']} />
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {items.length === 0
                ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No systems yet.</td></tr>
                : items.map(item => (
                    <tr key={item.id} className={editingId === item.id ? 'bg-[var(--color-accent-surface)]' : ''}>
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{item.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.manufacturer ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.type}</td>
                      <td className="px-4 py-3"><div className="flex gap-1.5 justify-end"><Btn onClick={() => startEdit(item)}>Edit</Btn><Btn variant="danger" onClick={() => del(item.id, item.name)}>Delete</Btn></div></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PlatformsSection() {
  const [items, setItems] = useState<DbPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', group: 'WINDOWS' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const reload = () => {
    setLoading(true);
    fetch('/api/admin/platforms')
      .then((r) => readJson<DbPlatform[]>(r))
      .then(setItems)
      .catch(() => setFormError('Failed to load platforms.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  function startEdit(item: DbPlatform) {
    setShowAdd(false); setEditingId(item.id);
    setForm({ name: item.name, group: item.group }); setFormError('');
  }
  function startAdd() {
    setEditingId(null); setShowAdd(true);
    setForm({ name: '', group: 'WINDOWS' }); setFormError('');
  }
  function cancel() { setEditingId(null); setShowAdd(false); setFormError(''); }

  async function save() {
    setSaving(true); setFormError('');
    try {
      const url = editingId ? `/api/admin/platforms/${editingId}` : '/api/admin/platforms';
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? 'Save failed'); return; }
      cancel(); reload();
    } finally { setSaving(false); }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete platform "${name}"?`)) return;
    const res = await fetch(`/api/admin/platforms/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Delete failed'); return; }
    reload();
  }

  const showForm = showAdd || editingId !== null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--color-text)]">Platforms</h3>
        {!showForm && <Btn variant="primary" onClick={startAdd}>Add New</Btn>}
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] p-4 space-y-3">
          <p className="text-sm font-medium text-[var(--color-text)]">{editingId ? 'Edit Platform' : 'New Platform'}</p>
          <FieldRow label="Name"><input className={input()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FieldRow>
          <FieldRow label="Group">
            <select className={input()} value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
              {PLATFORM_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </FieldRow>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
            <Btn onClick={cancel}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading…</p> : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-sm">
            <TableHead cols={['Name', 'Group', 'Actions']} />
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {items.length === 0
                ? <tr><td colSpan={3} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No platforms yet.</td></tr>
                : items.map(item => (
                    <tr key={item.id} className={editingId === item.id ? 'bg-[var(--color-accent-surface)]' : ''}>
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{item.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.group}</td>
                      <td className="px-4 py-3"><div className="flex gap-1.5 justify-end"><Btn onClick={() => startEdit(item)}>Edit</Btn><Btn variant="danger" onClick={() => del(item.id, item.name)}>Delete</Btn></div></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function HardwareSection() {
  const [items, setItems] = useState<DbHardware[]>([]);
  const [platforms, setPlatforms] = useState<DbPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', manufacturer: '', type: 'HANDHELD', primaryPlatformId: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const reload = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/hardware').then((r) => readJson<DbHardware[]>(r)),
      fetch('/api/admin/platforms').then((r) => readJson<DbPlatform[]>(r)),
    ])
      .then(([hw, pl]) => { setItems(hw); setPlatforms(pl); })
      .catch(() => setFormError('Failed to load hardware.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  function startEdit(item: DbHardware) {
    setShowAdd(false); setEditingId(item.id);
    setForm({ name: item.name, manufacturer: item.manufacturer ?? '', type: item.type, primaryPlatformId: item.primaryPlatformId ?? '' });
    setFormError('');
  }
  function startAdd() {
    setEditingId(null); setShowAdd(true);
    setForm({ name: '', manufacturer: '', type: 'HANDHELD', primaryPlatformId: '' }); setFormError('');
  }
  function cancel() { setEditingId(null); setShowAdd(false); setFormError(''); }

  async function save() {
    setSaving(true); setFormError('');
    try {
      const body = {
        name: form.name,
        manufacturer: form.manufacturer || null,
        type: form.type,
        primaryPlatformId: form.primaryPlatformId || null,
      };
      const url = editingId ? `/api/admin/hardware/${editingId}` : '/api/admin/hardware';
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? 'Save failed'); return; }
      cancel(); reload();
    } finally { setSaving(false); }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete hardware "${name}"?`)) return;
    const res = await fetch(`/api/admin/hardware/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Delete failed'); return; }
    reload();
  }

  const showForm = showAdd || editingId !== null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--color-text)]">Hardware</h3>
        {!showForm && <Btn variant="primary" onClick={startAdd}>Add New</Btn>}
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] p-4 space-y-3">
          <p className="text-sm font-medium text-[var(--color-text)]">{editingId ? 'Edit Hardware' : 'New Hardware'}</p>
          <FieldRow label="Name"><input className={input()} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FieldRow>
          <FieldRow label="Manufacturer"><input className={input()} value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="Optional" /></FieldRow>
          <FieldRow label="Type">
            <select className={input()} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {HARDWARE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Platform">
            <select className={input()} value={form.primaryPlatformId} onChange={e => setForm(f => ({ ...f, primaryPlatformId: e.target.value }))}>
              <option value="">None</option>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FieldRow>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
            <Btn onClick={cancel}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading…</p> : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-sm">
            <TableHead cols={['Name', 'Manufacturer', 'Type', 'Platform', 'Actions']} />
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {items.length === 0
                ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No hardware yet.</td></tr>
                : items.map(item => (
                    <tr key={item.id} className={editingId === item.id ? 'bg-[var(--color-accent-surface)]' : ''}>
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{item.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.manufacturer ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.type}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.primaryPlatform?.name ?? '—'}</td>
                      <td className="px-4 py-3"><div className="flex gap-1.5 justify-end"><Btn onClick={() => startEdit(item)}>Edit</Btn><Btn variant="danger" onClick={() => del(item.id, item.name)}>Delete</Btn></div></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SeedDataTab() {
  return (
    <div className="space-y-10">
      <SystemsSection />
      <PlatformsSection />
      <HardwareSection />
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

interface AdminReport {
  id: string;
  targetType: string;
  targetId: string | null;
  credibilityWeight: number;
  comment: string | null;
  status: string;
  upheldAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  reporter: { id: string; username: string | null };
  targetUser: { id: string; username: string | null } | null;
}

const REPORT_STATUSES   = ['', 'PENDING', 'UPHELD', 'DISMISSED'];
const REPORT_TARGET_TYPES = ['', 'LISTING', 'EDIT', 'RATING', 'COMMENT', 'TAG'];

function ReportsTab() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(() => {
    setLoading(true); setError('');
    const p = new URLSearchParams({ page: String(page) });
    if (statusFilter) p.set('status', statusFilter);
    if (typeFilter) p.set('targetType', typeFilter);
    fetch(`/api/admin/reports?${p}`)
      .then((r) => readJson<{ data?: AdminReport[]; meta?: typeof meta }>(r))
      .then(json => {
        setReports(json.data ?? []);
        setMeta(json.meta ?? { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err: Error) => setError(err.message || 'Failed to load reports.'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className={input('w-auto')}
        >
          {REPORT_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className={input('w-auto')}
        >
          {REPORT_TARGET_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="min-w-full text-sm">
          <TableHead cols={['Type', 'Reporter', 'Reported User', 'Comment', 'Status', 'Weight', 'Submitted', 'Reviewed']} />
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 rounded bg-[var(--color-surface-raised)] animate-pulse" /></td></tr>
                ))
              : reports.length === 0
              ? <tr><td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No reports found.</td></tr>
              : reports.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-xs font-medium text-[var(--color-text)]">{r.targetType}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{r.reporter.username ?? r.reporter.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{r.targetUser ? (r.targetUser.username ?? r.targetUser.id.slice(0, 8)) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] max-w-[180px] truncate">{r.comment ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-medium ${r.status === 'PENDING' ? 'text-amber-500' : r.status === 'UPHELD' ? 'text-red-500' : 'text-[var(--color-text-muted)]'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{r.credibilityWeight.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">{meta.total} total reports</p>
      <Pagination page={page} totalPages={meta.totalPages} onChange={p => setPage(p)} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!authLoading && (!user || !user.isSuperAdmin)) router.push('/');
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-[var(--color-text-muted)]">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Admin Dashboard</h1>

      <div className="flex gap-0 mb-6 border-b border-[var(--color-border)]">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.value
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users'    && <UsersTab />}
      {activeTab === 'seed'     && <SeedDataTab />}
      {activeTab === 'reports'  && <ReportsTab />}
    </div>
  );
}
