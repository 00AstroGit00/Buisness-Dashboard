/**
 * useSearch Hook - Performance Optimized
 * Features: 150ms Debouncing, Web Worker offloading, and Global Focus Shortcut.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSearch<T>(data: T[], fields: string[], debounceMs: number = 150) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(data);
  const [isSearching, setIsSearching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/searchWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e: MessageEvent) => {
      setResults(e.data);
      setIsSearching(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Keyboard Shortcut: Cmd/Ctrl + F to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update results when data changes (e.g. stock updates)
  useEffect(() => {
    if (!query) {
      setResults(data);
    } else {
      // Re-run search on new data if query exists
      workerRef.current?.postMessage({ query, data, fields });
    }
  }, [data]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setIsSearching(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current as any);
    }

    timeoutRef.current = setTimeout(() => {
      workerRef.current?.postMessage({ query: newQuery, data, fields });
    }, debounceMs);
  }, [data, fields, debounceMs]);

  return {
    query,
    results,
    handleSearch,
    isSearching
  };
}
