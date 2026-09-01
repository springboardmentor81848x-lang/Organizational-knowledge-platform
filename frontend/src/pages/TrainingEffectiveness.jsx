import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  GraduationCap,
  Users,
  TrendingUp,
  Target,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";

const calculateStatus = (effectiveness, completionRate) => {
  if (effectiveness >= 75 || completionRate >= 80) return "Excellent";
  if (effectiveness >= 55 || completionRate >= 60) return "Good";
  return "Needs Attention";
};

function SummaryCard({ title, value, description, icon, iconClass, trend }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">{value}</h2>
          <p className="text-xs text-slate-400 mt-2">{description}</p>
          {trend && <p className="text-xs text-emerald-600 mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function TrainingEffectiveness() {
  const [summary, setSummary] = useState({
    totalTrainings: 0,
    totalEmployeesEnrolled: 0,
    trainingCompletionRate: 0,
    averageSkillImprovement: 0,
    knowledgeGapReduction: 0,
    overallTrainingEffectiveness: 0,
  });
  const [trainings, setTrainings] = useState([]);
  const [skillImprovement, setSkillImprovement] = useState({ items: [], averageImprovement: 0 });
  const [gapReduction, setGapReduction] = useState({
    gapsBeforeTraining: 0,
    gapsAfterTraining: 0,
    resolvedGaps: 0,
    remainingGaps: 0,
    reductionPercent: 0,
  });
  const [attention, setAttention] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("effectiveness");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, trainingsRes, skillRes, gapRes, attentionRes] = await Promise.all([
        api.get("/hr/training-effectiveness/summary"),
        api.get("/hr/training-effectiveness/trainings"),
        api.get("/hr/training-effectiveness/skill-improvement"),
        api.get("/hr/training-effectiveness/gap-reduction"),
        api.get("/hr/training-effectiveness/attention"),
      ]);

      setSummary(summaryRes.data || {});
      setTrainings(Array.isArray(trainingsRes.data) ? trainingsRes.data : []);
      setSkillImprovement(skillRes.data || { items: [], averageImprovement: 0 });
      setGapReduction(gapRes.data || {
        gapsBeforeTraining: 0,
        gapsAfterTraining: 0,
        resolvedGaps: 0,
        remainingGaps: 0,
        reductionPercent: 0,
      });
      setAttention(Array.isArray(attentionRes.data) ? attentionRes.data : []);
    } catch (err) {
      console.error("Error loading training effectiveness data:", err);
      setError("Unable to load training effectiveness data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTrainings = useMemo(() => {
    const searched = trainings.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (item.courseName || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...searched].sort((a, b) => {
      if (sortBy === "completionRate") return (b.completionRate || 0) - (a.completionRate || 0);
      if (sortBy === "effectiveness") return (b.effectiveness || 0) - (a.effectiveness || 0);
      if (sortBy === "averageSkillImprovement") return (b.averageSkillImprovement || 0) - (a.averageSkillImprovement || 0);
      return (b.employeesEnrolled || 0) - (a.employeesEnrolled || 0);
    });
  }, [trainings, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTrainings.length / pageSize));
  const paginatedTrainings = filteredTrainings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  const comparisonData = useMemo(() => {
    return (skillImprovement.items || []).slice(0, 8).map((item) => ({
      name: item.employee?.split(" ")[0] || "Employee",
      before: Number(item.before || 0),
      after: Number(item.after || 0),
    }));
  }, [skillImprovement]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />
        <div className="flex-1 min-w-0">
          <Navbar title="Training Effectiveness" />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-slate-500">Loading training effectiveness data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />
        <div className="flex-1 min-w-0">
          <Navbar title="Training Effectiveness" />
          <main className="p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-lg mx-auto">
              <AlertTriangle size={42} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600">Unable to load</h2>
              <p className="text-slate-600 mt-3">{error}</p>
              <button
                onClick={fetchData}
                className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="HR" />
      <div className="flex-1 min-w-0">
        <Navbar title="Training Effectiveness" />

        <main className="p-5 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Training Effectiveness</h1>
              <p className="text-slate-500 mt-2">Measure training participation, completion, skill improvement, and knowledge-gap reduction.</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            <SummaryCard title="Total Trainings" value={summary.totalTrainings ?? 0} description="Distinct courses in the training portfolio" icon={<GraduationCap size={24} />} iconClass="bg-indigo-100 text-indigo-600" />
            <SummaryCard title="Total Employees Enrolled" value={summary.totalEmployeesEnrolled ?? 0} description="Employees with training participation" icon={<Users size={24} />} iconClass="bg-blue-100 text-blue-600" />
            <SummaryCard title="Training Completion Rate" value={`${summary.trainingCompletionRate ?? 0}%`} description="Completed vs enrolled training records" icon={<Target size={24} />} iconClass="bg-emerald-100 text-emerald-600" />
            <SummaryCard title="Average Skill Improvement" value={`${summary.averageSkillImprovement ?? 0}%`} description="Average improvement after training" icon={<TrendingUp size={24} />} iconClass="bg-purple-100 text-purple-600" />
            <SummaryCard title="Knowledge Gap Reduction" value={`${summary.knowledgeGapReduction ?? 0}%`} description="Measured reduction in skill gaps" icon={<Target size={24} />} iconClass="bg-orange-100 text-orange-600" />
            <SummaryCard title="Overall Training Effectiveness" value={`${summary.overallTrainingEffectiveness ?? 0}%`} description="Combined quality of training outcomes" icon={<TrendingUp size={24} />} iconClass="bg-cyan-100 text-cyan-600" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Training Performance</h2>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Search training or category" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700">
                <option value="All">All Status</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700">
                <option value="effectiveness">Sort by Effectiveness</option>
                <option value="completionRate">Sort by Completion</option>
                <option value="averageSkillImprovement">Sort by Skill Improvement</option>
                <option value="employeesEnrolled">Sort by Enrolled</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Training/Course Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employees Enrolled</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Completed</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Completion Rate</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Average Skill Improvement</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Knowledge Gap Reduction</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Effectiveness</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrainings.length > 0 ? paginatedTrainings.map((item, index) => (
                    <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-800">{item.courseName || "Unknown"}</td>
                      <td className="px-4 py-4 text-slate-600">{item.category || "General"}</td>
                      <td className="px-4 py-4 text-slate-600">{item.employeesEnrolled || 0}</td>
                      <td className="px-4 py-4 text-slate-600">{item.completed || 0}</td>
                      <td className="px-4 py-4 text-slate-600">{item.completionRate || 0}%</td>
                      <td className="px-4 py-4 text-slate-600">{item.averageSkillImprovement || 0}%</td>
                      <td className="px-4 py-4 text-slate-600">{item.knowledgeGapReduction || 0}%</td>
                      <td className="px-4 py-4 text-slate-600">{item.effectiveness || 0}%</td>
                      <td className="px-4 py-4 text-slate-600">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === "Excellent" ? "bg-emerald-100 text-emerald-700" : item.status === "Good" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                          {item.status || "Needs Attention"}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">No training performance data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredTrainings.length > pageSize && (
              <div className="flex justify-end items-center gap-3 mt-5">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-50">Prev</button>
                <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-5">Training Completion Rate</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trainings}
                    margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseName" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-5">Skill Improvement After Training</h2>
              <div className="h-72">
                {comparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="before" stroke="#94a3b8" strokeWidth={2} name="Before Training" />
                      <Line type="monotone" dataKey="after" stroke="#4f46e5" strokeWidth={2} name="After Training" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">Insufficient historical data to show skill improvement.</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Knowledge Gap Reduction</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Gaps Before Training</p><h3 className="text-2xl font-bold text-slate-800 mt-2">{gapReduction.gapsBeforeTraining ?? 0}</h3></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Gaps After Training</p><h3 className="text-2xl font-bold text-slate-800 mt-2">{gapReduction.gapsAfterTraining ?? 0}</h3></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Resolved Gaps</p><h3 className="text-2xl font-bold text-slate-800 mt-2">{gapReduction.resolvedGaps ?? 0}</h3></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Remaining Gaps</p><h3 className="text-2xl font-bold text-slate-800 mt-2">{gapReduction.remainingGaps ?? 0}</h3></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Reduction %</p><h3 className="text-2xl font-bold text-slate-800 mt-2">{gapReduction.reductionPercent ?? 0}%</h3></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Trainings Requiring Attention</h2>
            {attention.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Training Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Completion Rate</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Skill Improvement</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Remaining Gaps</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Suggested Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attention.map((item, index) => (
                      <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-800">{item.trainingName || "Unknown"}</td>
                        <td className="px-4 py-4 text-slate-600">{item.completionRate || 0}%</td>
                        <td className="px-4 py-4 text-slate-600">{item.skillImprovement || 0}%</td>
                        <td className="px-4 py-4 text-slate-600">{item.remainingGaps || 0}</td>
                        <td className="px-4 py-4 text-slate-600">{item.suggestedAction || "Review Course"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">No training requires attention right now.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Employee Training Impact</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employee</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Department</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Training</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Skill Before</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Skill After</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Improvement</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Gap Before</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Gap After</th>
                  </tr>
                </thead>
                <tbody>
                  {skillImprovement.items.length > 0 ? skillImprovement.items.map((item, index) => (
                    <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-800 font-medium">{item.employee || "Unknown"}</td>
                      <td className="px-4 py-4 text-slate-600">{item.department || "Unassigned"}</td>
                      <td className="px-4 py-4 text-slate-600">Training Impact</td>
                      <td className="px-4 py-4 text-slate-600">{item.before ?? 0}</td>
                      <td className="px-4 py-4 text-slate-600">{item.after ?? 0}</td>
                      <td className="px-4 py-4 text-slate-600">{item.improvement ?? 0}</td>
                      <td className="px-4 py-4 text-slate-600">{Math.max(0, item.before ? 5 - item.before : 0)}</td>
                      <td className="px-4 py-4 text-slate-600">{Math.max(0, item.after ? 5 - item.after : 0)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No employee training impact data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
