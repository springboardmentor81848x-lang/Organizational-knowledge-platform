import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Filter } from 'lucide-react';
import { searchService } from '../../services/api';
import { SearchResultCard } from './SearchResultCard';
import { QuickViewModal } from './QuickViewModal';

export const GlobalElasticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const searchRef = useRef(null);

  const categories = ['All', 'Employees', 'Skills', 'Courses', 'Departments', 'Mentors', 'Reports'];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchService.query(query);
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = categoryFilter === 'All'
    ? results
    : results.filter(item => item.category === categoryFilter);

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Elastic Search across Employees, Skills, Courses, Departments, Mentors..."
          className="w-full pl-10 pr-24 py-2 text-xs md:text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition shadow-inner"
        />
        <div className="absolute right-3 flex items-center space-x-1">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Suggestions Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
          {/* Category Filter Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="p-3 overflow-y-auto space-y-2">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                Searching intelligence index...
              </div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  onQuickView={(i) => setSelectedItem(i)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching results found for "{query}"
              </div>
            )}
          </div>

          {/* Results Footer */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Elastic Search Engine v4.2</span>
            </span>
            <span>{filteredResults.length} matches found</span>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
