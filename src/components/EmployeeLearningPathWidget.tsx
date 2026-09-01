import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, ExternalLink, ArrowRight, RefreshCw, Flame, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EmployeeLearningPathWidget: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [completingItemId, setCompletingItemId] = useState<number | null>(null);

  const fetchWidgetData = async () => {
    try {
      setLoading(true);

      // Get logged in employee profile or fallback to 1
      const empRes = await api.get('/employees');
      let empId = 1;
      if (empRes.data.success && empRes.data.employees) {
        const match = empRes.data.employees.find((e: any) => e.email === user?.email || e.user_id === user?.id);
        if (match) empId = match.id;
      }

      const res = await api.get(`/learning-path/${empId}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load learning path widget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgetData();
  }, [user]);

  const handleComplete = async (itemId: number) => {
    try {
      setCompletingItemId(itemId);
      const res = await api.put(`/learning-path/items/${itemId}/complete`);
      if (res.data.success) {
        await fetchWidgetData();
      }
    } catch (err) {
      console.error('Item completion failed:', err);
    } finally {
      setCompletingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-24 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const paths = Array.isArray(data?.learningPaths) ? data.learningPaths : [];

  if (!data || paths.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">My Skill Learning Path</h3>
          </div>
          <Link to="/learning-path" className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800">
            View Roadmaps
          </Link>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-xs">All Skill Benchmarks Satisfied!</p>
              <p className="text-[10px] text-emerald-800">No active knowledge gaps detected in your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topPath = paths[0]; // First priority gap
  const nextItem = topPath?.nextRecommendedStep || (Array.isArray(topPath?.items) ? topPath.items[0] : null);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">My Active Learning Path</h3>
            <p className="text-[10px] text-slate-500 font-medium">Personalized upskilling loop</p>
          </div>
        </div>

        <Link
          to="/learning-path"
          className="text-xs font-extrabold text-slate-900 hover:text-emerald-600 inline-flex items-center gap-1 transition-colors"
        >
          <span>Full Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress Bars for Top Gaps */}
      <div className="space-y-3">
        {paths.slice(0, 3).map((path: any) => (
          <div key={path.pathId} className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-800 flex items-center gap-1.5 truncate">
                <Flame className="w-3 h-3 text-emerald-600" />
                {path.skillName}
              </span>
              <span className="text-emerald-700 font-black">{path.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${path.progressPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Next Course Action Card */}
      {nextItem && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span>Next Recommended Step</span>
            <span className="text-emerald-700">{nextItem.platform}</span>
          </div>

          <p className="font-extrabold text-slate-900 text-xs">{nextItem.title}</p>

          <div className="flex items-center justify-between pt-1">
            <a
              href={nextItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold text-slate-900 hover:text-emerald-600 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Course</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => handleComplete(nextItem.itemId)}
              disabled={completingItemId === nextItem.itemId}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              {completingItemId === nextItem.itemId ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span>Complete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
