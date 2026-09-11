import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Star, Bookmark, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CourseCard = ({ course, onBookmark, isBookmarked = false }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="enterprise-card overflow-hidden flex flex-col justify-between group border border-slate-200/80 dark:border-slate-800"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-44 overflow-hidden bg-slate-900">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* AI Match Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-blue-600/90 text-white backdrop-blur-md text-[11px] font-extrabold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>{course.matchScore}% AI Match</span>
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark && onBookmark(course);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
            isBookmarked
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900 hover:text-white'
          }`}
          title="Save Later"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
          {course.difficulty}
        </div>
      </div>

      {/* Content Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>{course.provider}</span>
            <div className="flex items-center space-x-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">{course.rating}</span>
            </div>
          </div>

          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
            {course.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
            {course.description}
          </p>
        </div>

        {/* Target Skill Gap */}
        <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Target Gap:</span>
          <span className="truncate max-w-[170px] text-right font-extrabold">{course.skillGap}</span>
        </div>

        {/* Course Duration & Start Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/employee/course/${course.id}`)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Learning</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
