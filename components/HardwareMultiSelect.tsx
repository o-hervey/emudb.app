'use client';

import { useEffect, useRef, useState } from 'react';

interface HardwareOption {
  id: string;
  name: string;
  platformGroup?: string | null;
}

interface HardwareMultiSelectProps {
  label: string;
  options: HardwareOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

const GROUP_LABELS: Record<string, string> = {
  CONSOLE: 'Console',
  LINUX:   'Linux',
  MACOS:   'macOS',
  MOBILE:  'Mobile',
  WINDOWS: 'Windows',
  OTHER:   'Other',
};

function groupOrder(group: string): number {
  if (group === 'OTHER') return 999;
  return GROUP_LABELS[group]?.charCodeAt(0) ?? 500;
}

function buildGroups(options: HardwareOption[]): { group: string; label: string; items: HardwareOption[] }[] {
  const map = new Map<string, HardwareOption[]>();
  for (const opt of options) {
    const g = opt.platformGroup ?? 'OTHER';
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(opt);
  }
  const groups = Array.from(map.entries())
    .sort(([a], [b]) => groupOrder(a) - groupOrder(b))
    .map(([group, items]) => ({
      group,
      label: GROUP_LABELS[group] ?? group,
      items: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }));
  return groups;
}

export function HardwareMultiSelect({ label, options, selected, onChange }: HardwareMultiSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedOptions = options.filter((o) => selected.includes(o.id));

  const lq = query.toLowerCase();
  const filteredOptions = query
    ? options.filter((o) => !selected.includes(o.id) && o.name.toLowerCase().includes(lq))
    : options.filter((o) => !selected.includes(o.id));

  const groups = buildGroups(filteredOptions);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    setQuery('');
    inputRef.current?.focus();
  }

  function toggleGroup(groupItems: HardwareOption[]) {
    const groupIds = groupItems.map((i) => i.id);
    const allSelected = groupIds.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !groupIds.includes(id)));
    } else {
      const toAdd = groupIds.filter((id) => !selected.includes(id));
      onChange([...selected, ...toAdd]);
    }
    setQuery('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && query === '' && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{label}</label>
      <div
        className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 flex flex-wrap gap-1.5 focus-within:border-[var(--color-accent)] transition-colors cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selectedOptions.map((o) => (
          <span
            key={o.id}
            className="flex items-center gap-1 bg-[var(--color-accent-surface)] text-[var(--color-accent)] text-xs rounded-full px-2.5 py-0.5"
          >
            {o.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(o.id); }}
              className="opacity-60 hover:opacity-100 leading-none"
              aria-label={`Remove ${o.name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length === 0 ? `Search ${label.toLowerCase()}…` : ''}
          aria-label={label}
          className="flex-1 min-w-24 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      {open && (groups.length > 0 || (query.length > 0 && filteredOptions.length === 0)) && (
        <div className="absolute z-10 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
          {groups.length === 0 ? (
            <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">No matches</div>
          ) : (
            groups.map(({ group, label: groupLabel, items }) => {
              const allGroupSelected = items.every((i) => selected.includes(i.id));
              const someGroupSelected = items.some((i) => selected.includes(i.id));
              return (
                <div key={group}>
                  {/* Group header / bulk-select */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleGroup(items)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors"
                  >
                    <span>{groupLabel}</span>
                    <span className={`text-[10px] font-medium ${allGroupSelected ? 'text-[var(--color-accent)]' : someGroupSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                      {allGroupSelected ? 'Deselect all' : 'Select all'}
                    </span>
                  </button>
                  {/* Devices in group */}
                  {items.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(o.id)}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
