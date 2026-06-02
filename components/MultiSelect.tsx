'use client';

import { useEffect, useRef, useState } from 'react';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, selected, onChange, placeholder }: MultiSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOptions = options.filter((o) => selected.includes(o.id));
  const filteredOptions = options.filter(
    (o) => !selected.includes(o.id) && o.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    setQuery('');
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
        toggle(filteredOptions[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(-1);
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
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setFocusedIndex(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length === 0 ? (placeholder ?? `Search ${label.toLowerCase()}…`) : ''}
          aria-label={label}
          className="flex-1 min-w-24 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </div>
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
          {filteredOptions.slice(0, 60).map((o, i) => (
            <button
              key={o.id}
              ref={(el) => { optionRefs.current[i] = el; }}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggle(o.id)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                i === focusedIndex
                  ? 'bg-[var(--color-accent-surface)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
      {open && filteredOptions.length === 0 && query.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
          No matches
        </div>
      )}
    </div>
  );
}
