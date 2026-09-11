import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 animate-fade-in">
      <Link
        to="/"
        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = value
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formattedName}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
