import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { mockRecommendedCourses } from '../../services/mockData';
import { Sparkles, Play, Bookmark, Clock, Award, Check, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIRecommendations = () => {
  const [courses, setCourses] = useState(mockRecommendedCourses);
  const [activeFilter, setActiveFilter] = useState('All');

  const toggleSaveLater = (id) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, saved: !c.saved } : c))
    );
  };

  const categories = ['All', 'AI & Machine Learning', 'Cloud & DevOps', 'Frontend Engineering', 'Backend Architecture'];

  const filteredCourses = activeFilter === 'All'
    ? courses
    : courses.filter(c => c.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
            <h1 className="text-2xl font-extrabold tracking-tight">
              AI Personalized Training Recommendations
            </h1>
          </div>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-2xl">
            Our machine learning engine analyzed your target career benchmark (Lead Cloud Architect) and generated prioritized courses to close your critical skill gaps.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
          <div className="text-2xl font-black">94.2%</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Avg Skill Gap Precision</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommended Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {course.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                    {course.title}
                  </h3>
                </div>
                {/* AI Match Score Pill */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{course.aiMatchScore}% Match</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {course.description}
              </p>

              {/* Metadata Badges */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Target Skill Gap</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 truncate block">
                    {course.skillGap}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Difficulty</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {course.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {course.duration}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar progress={course.progress} showPercentage={true} color="bg-blue-600" />
            </div>

            {/* Actions: Start Learning & Save Later */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => toggleSaveLater(course.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  course.saved
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${course.saved ? 'fill-current text-amber-500' : ''}`} />
                <span>{course.saved ? 'Saved' : 'Save Later'}</span>
              </button>

              <Link
                to={`/employee/course/${course.id}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{course.progress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
