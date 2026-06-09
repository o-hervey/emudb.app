'use client';

import type { FiltersData } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';

interface FiltersContextValue {
  filters: FiltersData | null;
  loading: boolean;
  error: string;
}

const FiltersContext = createContext<FiltersContextValue>({ filters: null, loading: true, error: '' });

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FiltersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/filters')
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? 'Failed to load filters.');
        return json;
      })
      .then(setFilters)
      .catch(() => setError('Failed to load filter options. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FiltersContext.Provider value={{ filters, loading, error }}>
      {children}
    </FiltersContext.Provider>
  );
}

export const useFilters = () => useContext(FiltersContext);
