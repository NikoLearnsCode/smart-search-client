import {createContext, useContext} from 'react';
import type {RefObject} from 'react';
import type {SearchResult} from '@/types/document';

export type SearchStateValue = {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  deferredQuery: string;
  results: SearchResult[];
  loading: boolean;
  hasQuery: boolean;
  setQuery: (query: string) => void;
  resetKey: string;
};

export const SearchStateContext = createContext<SearchStateValue | null>(null);

export function useSearchState() {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState must be used within a SearchProvider');
  }
  return context;
}

