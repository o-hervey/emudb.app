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
  const ref = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((o) => selected.includes(o.id));
  const filteredOptions = options.filter(
    (o) => !selected.includes(o.id) && o.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    setQuery('');
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">{label}</label>
      <div
        className="min-h-10 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 flex flex-wrap gap-1.5 focus-within:border-indigo-500 transition-colors cursor-text"
        onClick={() => setOpen(true)}
      >
        {selectedOptions.map((o) => (
          <span key={o.id} className="flex items-center gap-1 bg-zinc-700 text-zinc-200 text-xs rounded px-2 py-0.5">
            {o.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(o.id); }}
              className="text-zinc-400 hover:text-zinc-100 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selectedOptions.length === 0 ? (placeholder ?? `Search ${label.toLowerCase()}…`) : ''}
          className="flex-1 min-w-24 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />
      </div>
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded border border-zinc-700 bg-zinc-900 shadow-xl">
          {filteredOptions.slice(0, 60).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
      {open && filteredOptions.length === 0 && query.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-500">
          No matches
        </div>
      )}
    </div>
  );
}
