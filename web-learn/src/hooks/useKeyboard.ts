import { useEffect } from 'react';
import { useSearch } from '../context/SearchContext';

export function useKeyboard() {
  const { openPalette, closePalette, isOpen } = useSearch();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) { closePalette(); } else { openPalette(); }
      }
      if (e.key === 'Escape' && isOpen) {
        closePalette();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openPalette, closePalette, isOpen]);
}
