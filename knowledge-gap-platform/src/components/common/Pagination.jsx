import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage = 1, totalPages = 5, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Page <span className="font-semibold text-slate-900 dark:text-slate-100">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-900 dark:text-slate-100">{totalPages}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange && onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
