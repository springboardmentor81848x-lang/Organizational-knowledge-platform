import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Search,
  Users,
  Flame,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Code2,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LearningPathModule: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Selected Employee ID — initialized from the logged-in user's own
  // employee record (available immediately via AuthContext) rather than a
  // hardcoded id, so "My Learning" always opens on the right person by
  // default. Managers/admins can still switch via the employee picker.
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    (user as any)?.employee?.id ?? null
  );
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Learning Path Data State
  const [learningPathData, setLearningPathData] = useState<any>(null);
  const [completingItemId, setCompletingItemId] = useState<number | null>(null);

  // Active View Tab: 'roadmap' | 'library'
  const [activeTab, setActiveTab] = useState<'roadmap' | 'library'>('roadmap');

  // Resource Library State
  const [resources, setResources] = useState<any[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>('');
  const [libraryFilterSkill, setLibraryFilterSkill] = useState<string>('All');
  const [libraryFilterPlatform, setLibraryFilterPlatform] = useState<string>('All');

  // Fetch employees list for dropdown (manager/admin employee picker)
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      // The real API returns { success, count, data } — not { employees }.
      if (res.data.success && res.data.data) {
        setEmployeesList(res.data.data);

        // Only use this as a fallback if we didn't already get the id
        // directly from the logged-in user's own employee record.
        if (!selectedEmployeeId) {
          const match = res.data.data.find((e: any) => e.email === user?.email || e.user_id === user?.id);
          if (match) {
            setSelectedEmployeeId(match.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load employees list:', err);
    }
  };

  // Fetch Employee Learning Path from API
  const fetchLearningPath = async (empId: number | null) => {
    if (!empId) {
      setError('No employee profile is linked to this account yet.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/learning-path/${empId}`);
      if (res.data.success) {
        setLearningPathData(res.data);
      } else {
        setError(res.data.message || 'Failed to load employee learning path');
      }
    } catch (err: any) {
      console.error('Error fetching learning path:', err);
      setError(err.response?.data?.message || err.message || 'Error loading learning path');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Resource Library
  const fetchResources = async () => {
    try {
      const res = await api.get('/learning-resources');
      if (res.data.success && res.data.resources) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Error fetching learning resources library:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchResources();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchLearningPath(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  // Mark a Learning Resource Item as Completed
  const handleMarkItemCompleted = async (itemId: number) => {
    try {
      setCompletingItemId(itemId);
      const res = await api.put(`/learning-path/items/${itemId}/complete`);
      if (res.data.success) {
        // Optimistically update item in state
        if (learningPathData && learningPathData.learningPaths) {
          const updatedPaths = learningPathData.learningPaths.map((p: any) => {
            const updatedItems = p.items.map((it: any) => {
              if (it.itemId === itemId) {
                return { ...it, status: 'Completed', completedAt: new Date().toISOString() };
              }
              return it;
            });
            const compCount = updatedItems.filter((it: any) => it.status === 'Completed').length;
            const prog = Math.round((compCount / updatedItems.length) * 100);
            return {
              ...p,
              items: updatedItems,
              completedSteps: compCount,
              progressPercentage: prog,
              status: prog === 100 ? 'Completed' : 'Active',
            };
          });

          const totalProg = Math.round(
            updatedPaths.reduce((acc: number, p: any) => acc + p.progressPercentage, 0) / updatedPaths.length
          );

          setLearningPathData({
            ...learningPathData,
            learningPaths: updatedPaths,
            overallProgress: totalProg,
            completedSkillPaths: updatedPaths.filter((p: any) => p.progressPercentage === 100).length,
          });
        }

        // Re-fetch to synchronize
        await fetchLearningPath(selectedEmployeeId);
      }
    } catch (err: any) {
      console.error('Failed to complete learning path item:', err);
    } finally {
      setCompletingItemId(null);
    }
  };

  // Helper for platform badge styling
  const getPlatformBadge = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('coursera')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (p.includes('codechef')) return 'bg-amber-50 text-amber-900 border-amber-300';
    if (p.includes('nptel')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (p.includes('simplilearn')) return 'bg-orange-50 text-orange-800 border-orange-200';
    if (p.includes('udemy')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (p.includes('youtube')) return 'bg-red-50 text-red-800 border-red-200';
    if (p.includes('geeksforgeeks')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (p.includes('hackerrank')) return 'bg-teal-50 text-teal-800 border-teal-200';
    if (p.includes('freecodecamp')) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    if (p.includes('linkedin')) return 'bg-sky-50 text-sky-800 border-sky-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Filtered resources for library tab
  const filteredResources = resources.filter((r) => {
    if (libraryFilterPlatform !== 'All' && r.platform !== libraryFilterPlatform) return false;
    if (libraryFilterSkill !== 'All' && r.skill_name !== libraryFilterSkill) return false;
    if (librarySearchQuery.trim()) {
      const q = librarySearchQuery.toLowerCase();
      const titleMatch = r.title?.toLowerCase().includes(q);
      const descMatch = r.description?.toLowerCase().includes(q);
      const platMatch = r.platform?.toLowerCase().includes(q);
      const skillMatch = r.skill_name?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !platMatch && !skillMatch) return false;
    }
    return true;
  });

  const platforms = ['All', 'Coursera', 'CodeChef', 'NPTEL', 'Simplilearn', 'YouTube', 'GeeksforGeeks', 'Udemy', 'HackerRank', 'freeCodeCamp', 'LinkedIn Learning'];

  const uniqueSkills = ['All', ...Array.from(new Set(resources.map((r) => r.skill_name).filter(Boolean)))];

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 mb-2">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Platform Technical Learning Pathways</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Personalized Skill Learning Roadmaps
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5 max-w-2xl">
            Curated technical roadmaps mapped to employee skill gaps across Coursera, CodeChef, NPTEL, Simplilearn, YouTube, and GeeksforGeeks.
          </p>
        </div>

        {/* Employee Selector for Managers/Admins */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <Users className="w-4 h-4 text-slate-500 ml-1" />
          <div>
            <label className="block text-[9px] font-extrabold uppercase text-slate-400">Employee Profile</label>
            <select
              value={selectedEmployeeId ?? ''}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-extrabold text-xs cursor-pointer focus:outline-hidden"
            >
              {employeesList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.designation || 'Staff'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roadmap'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Technical Roadmaps</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Resource Directory ({resources.length || 28})</span>
          </button>
        </div>

        <button
          onClick={() => fetchLearningPath(selectedEmployeeId)}
          className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs"
          title="Recalculate Gaps & Sync Learning Path"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sync Gaps</span>
        </button>
      </div>

      {/* MAIN CONTENT TAB 1: ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="font-extrabold text-slate-700">Loading Technical Learning Roadmaps...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-2">
              <p className="font-extrabold text-rose-900 text-sm">Failed to Load Learning Path</p>
              <p className="text-rose-700">{error}</p>
              <button
                onClick={() => fetchLearningPath(selectedEmployeeId)}
                className="mt-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : (
            <>
              {/* Overall Employee Progress Banner */}
              {learningPathData?.employee && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-base flex items-center justify-center border-2 border-emerald-400">
                        {learningPathData.employee.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white">{learningPathData.employee.name}</h2>
                        <p className="text-emerald-300 font-bold text-xs">
                          {learningPathData.employee.designation || 'Software Engineer'} • {learningPathData.employee.departmentName || 'Engineering'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15">
                      <div>
                        <p className="text-[10px] uppercase font-black text-emerald-300">Active Roadmaps</p>
                        <p className="text-xl font-black text-white">{learningPathData.totalSkillGaps || learningPathData.learningPaths?.length || 0}</p>
                      </div>
                      <div className="h-8 w-px bg-white/20" />
                      <div>
                        <p className="text-[10px] uppercase font-black text-emerald-300">Completed Paths</p>
                        <p className="text-xl font-black text-white">{learningPathData.completedSkillPaths || 0}</p>
                      </div>
                      <div className="h-8 w-px bg-white/20" />
                      <div>
                        <p className="text-[10px] uppercase font-black text-emerald-300">Roadmap Progress</p>
                        <p className="text-xl font-black text-emerald-400">{learningPathData.overallProgress || 0}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Curriculum Completion</span>
                      <span>{learningPathData.overallProgress || 0}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-700/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${learningPathData.overallProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Skill Paths Timeline / Roadmaps */}
              <div className="space-y-6">
                {learningPathData?.learningPaths?.map((path: any) => (
                  <div
                    key={path.pathId}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6"
                  >
                    {/* Path Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-extrabold border border-slate-200">
                            {path.skillCategory}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              path.priority === 'High'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {path.priority} Priority Track
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <Flame className="w-4 h-4 text-emerald-600" />
                          <span>{path.skillName}</span>
                          <span className="text-slate-400 text-xs font-normal">
                            (Level {path.currentProficiency} → Target Level {path.requiredProficiency})
                          </span>
                        </h3>
                      </div>

                      {/* Path Progress */}
                      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 min-w-[220px]">
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                            <span>Roadmap Completion %</span>
                            <span className="text-emerald-700 font-black">{path.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${path.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Sequence Steps */}
                    <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {path.items.map((item: any, itemIdx: number) => {
                        const isCompleted = item.status === 'Completed';
                        const isCompleting = completingItemId === item.itemId;

                        return (
                          <div key={item.itemId} className="relative group">
                            {/* Node Dot */}
                            <div
                              className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                                  : 'bg-white text-slate-600 border-2 border-slate-300 group-hover:border-emerald-500'
                              }`}
                            >
                              {isCompleted ? <Check className="w-3.5 h-3.5" /> : itemIdx + 1}
                            </div>

                            {/* Card Body */}
                            <div
                              className={`p-4 rounded-2xl border transition-all ${
                                isCompleted
                                  ? 'bg-emerald-50/40 border-emerald-200/90'
                                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Platform Badge */}
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getPlatformBadge(
                                        item.platform
                                      )}`}
                                    >
                                      {item.platform}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                                      {item.resourceType}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                      {item.difficulty}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {item.duration}
                                    </span>
                                  </div>

                                  <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                                  <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                                  {/* Start / View Resource Button */}
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                                  >
                                    <span>View Resource</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>

                                  {/* Mark Complete Button */}
                                  {isCompleted ? (
                                    <span className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-flex items-center gap-1 border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Completed</span>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleMarkItemCompleted(item.itemId)}
                                      disabled={isCompleting}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                      {isCompleting ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      )}
                                      <span>Mark Completed</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* MAIN CONTENT TAB 2: RESOURCE DIRECTORY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search resources by title, topic, platform..."
                  value={librarySearchQuery}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Skill Filter Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Skill Track:</span>
                <select
                  value={libraryFilterSkill}
                  onChange={(e) => setLibraryFilterSkill(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer focus:outline-hidden"
                >
                  {uniqueSkills.map((sk) => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Platform Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-2 shrink-0">
                Platform:
              </span>
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setLibraryFilterPlatform(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                    libraryFilterPlatform === p
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getPlatformBadge(res.platform)}`}>
                      {res.platform}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {res.difficulty}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{res.title}</h3>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{res.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">{res.resource_type} • {res.duration}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <span>Start Learning</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-extrabold text-slate-700">No resources found matching filter criteria</p>
              <p className="text-slate-500 text-xs">Try resetting the platform or search query filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
