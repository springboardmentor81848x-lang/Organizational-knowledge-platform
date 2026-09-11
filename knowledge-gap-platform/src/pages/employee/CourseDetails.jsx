import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { mockRecommendedCourses } from '../../services/mockData';
import { Play, CheckCircle2, Clock, Award, BookOpen, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

export const CourseDetails = () => {
  const { id } = useParams();
  const course = mockRecommendedCourses.find(c => c.id === id) || mockRecommendedCourses[0];

  const [openModule, setOpenModule] = useState(0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/employee/recommendations"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recommendations</span>
      </Link>

      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="purple" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {course.category}
          </Badge>
          <span className="text-xs text-blue-300 font-bold">• AI Match {course.aiMatchScore}%</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          {course.title}
        </h1>

        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
          <div className="flex items-center space-x-1 text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Duration: {course.duration}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Difficulty: {course.difficulty}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Instructor: {course.instructor}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center space-x-3">
          <button className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition">
            <Play className="w-4 h-4 fill-current" />
            <span>{course.progress > 0 ? 'Resume Module 2' : 'Start Course Now'}</span>
          </button>
        </div>
      </div>

      {/* Syllabus Breakdown Accordion */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>Course Syllabus & Modules</CardTitle>
          <CardDescription>Comprehensive curriculum designed for corporate gap closure</CardDescription>
        </CardHeader>

        <div className="space-y-2">
          {course.syllabi?.map((modTitle, idx) => {
            const isOpen = openModule === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenModule(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className={`w-4 h-4 ${idx === 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span>{modTitle}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <p>Includes hands-on interactive labs, architectural code snippets, and automated test evaluations.</p>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600">
                      <span>Video Lesson (45 mins)</span>
                      <span>Lab Challenge (30 mins)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
