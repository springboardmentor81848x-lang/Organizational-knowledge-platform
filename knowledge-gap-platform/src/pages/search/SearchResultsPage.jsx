import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { searchService } from '../../services/search';
import { SearchResultCard } from '../../components/search/SearchResultCard';
import { QuickViewModal } from '../../components/search/QuickViewModal';
import { Card } from '../../components/common/Card';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['All', 'Employees', 'Skills', 'Courses', 'Departments', 'Mentors', 'Reports'];

  const results = searchService.query(query, activeCategory).then ? [] : []; // sync fallback handle

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Search className="w-6 h-6 text-blue-600" />
          <span>Enterprise Intelligence Search</span>
        </h1>
        <p className="text-xs text-slate-500">
          Elastic search index across skills, courses, employees, departments, and executive reports.
        </p>
      </div>

      {/* Main Search Input */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all enterprise assets..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Showing results for "{query || 'all assets'}"</span>
        <span className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Elastic Intelligence Engine</span>
        </span>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
