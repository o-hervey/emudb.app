'use client';

import type { FiltersData } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';

interface FiltersContextValue {
  filters: FiltersData | null;
  loading: boolean;
}

const FiltersContext = createContext<FiltersContextValue>({ filters: null, loading: true });

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FiltersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/filters')
      .then((r) => r.json())
      .then(setFilters)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <FiltersContext.Provider value={{ filters, loading }}>
      {children}
    </FiltersContext.Provider>
  );
}

export const useFilters = () => useContext(FiltersContext);
