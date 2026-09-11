import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { searchService } from '../services/search';

export const useSearch = (initialQuery = '', initialCategory = 'All') => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchService.query(debouncedQuery, category).then((res) => {
      setResults(res.data);
      setLoading(false);
    });
  }, [debouncedQuery, category]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    loading,
  };
};
