import React from 'react';
import {
  User,
  BookOpen,
  Award,
  Building2,
  Users,
  FileText,
  Eye,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const SearchResultCard = ({ item, onQuickView }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Employees':
        return <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Skills':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'Courses':
        return <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Departments':
        return <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Mentors':
        return <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Reports':
        return <FileText className="w-5 h-5 text-rose-500" />;
      default:
        return <Zap className="w-5 h-5 text-blue-600" />;
    }
  };

  const getMatchBadgeVariant = (match) => {
    if (match >= 95) return 'success';
    if (match >= 90) return 'primary';
    return 'warning';
  };

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group">
      <div className="flex items-start space-x-3 min-w-0 pr-2">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition">
          {getCategoryIcon(item.category)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {item.title}
            </h4>
            <Badge variant="neutral" className="text-[10px] px-2 py-0.2">
              {item.category}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-md">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="text-right">
          <Badge variant={getMatchBadgeVariant(item.matchPercentage)}>
            {item.matchPercentage}% Match
          </Badge>
        </div>

        <button
          onClick={() => onQuickView && onQuickView(item)}
          className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>
    </div>
  );
};
