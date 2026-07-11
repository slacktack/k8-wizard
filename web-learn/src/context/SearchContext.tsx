import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SearchContextType {
  isOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPalette = useCallback(() => setIsOpen(true), []);
  const closePalette = useCallback(() => setIsOpen(false), []);

  return (
    <SearchContext.Provider value={{ isOpen, openPalette, closePalette }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
