import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { BookOpen, CheckCircle, Clock3, TrendingUp, Users } from "lucide-react";

function ManagerTrainingAdoption() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const managerEmployeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        if (!managerEmployeeId) {
          throw new Error("Manager employee ID not found.");
        }

        const response = await axios.get(
          `http://localhost:8080/api/manager-dashboard/manager/${managerEmployeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setDashboard(response.data);
      } catch (err) {
        console.error("Error loading training adoption:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Unable to load training adoption data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [managerEmployeeId, token]);

  const trainingStats = useMemo(() => {
    const adoption = dashboard?.trainingAdoption || {};
    const enrolled = Number(adoption.enrolled || 0);
    const inProgress = Number(adoption.inProgress || 0);
    const completed = Number(adoption.completed || 0);

    return {
      totalEnrollments: enrolled,
      activeTraining: inProgress,
      completedTraining: completed,
      completionRate: enrolled > 0 ? ((completed / enrolled) * 100).toFixed(0) : "0",
      progressAverage: dashboard?.skillCoverage?.length
        ? (
            dashboard.skillCoverage.reduce(
              (sum, item) => sum + Number(item.coveragePercentage || 0),
              0
            ) / dashboard.skillCoverage.length
          ).toFixed(0)
        : "0",
    };
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="MANAGER" />
        <div className="flex-1 min-w-0">
          <Navbar title="Training Adoption" />
          <main className="p-6">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-slate-700" />
              <p className="mt-4 text-slate-500">Loading training adoption...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="MANAGER" />
        <div className="flex-1 min-w-0">
          <Navbar title="Training Adoption" />
          <main className="p-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
              <h2 className="text-xl font-bold">Unable to load Training Adoption</h2>
              <p className="mt-2">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="MANAGER" />
      <div className="flex-1 min-w-0">
        <Navbar title="Training Adoption" />

        <main className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Training Adoption</h1>
            <p className="mt-1 text-slate-500">Monitor participation and completion of assigned learning programs.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard icon={<Users className="text-blue-600" size={18} />} label="Total Training Enrollments" value={trainingStats.totalEnrollments} helper="Current enrollments" />
            <SummaryCard icon={<BookOpen className="text-violet-600" size={18} />} label="Active Training" value={trainingStats.activeTraining} helper="In progress" />
            <SummaryCard icon={<CheckCircle className="text-emerald-600" size={18} />} label="Completed Training" value={trainingStats.completedTraining} helper="Successfully completed" />
            <SummaryCard icon={<TrendingUp className="text-sky-600" size={18} />} label="Average Completion Rate" value={`${trainingStats.completionRate}%`} helper="Across assigned training" />
            <SummaryCard icon={<TrendingUp className="text-amber-600" size={18} />} label="Average Training Progress" value={`${trainingStats.progressAverage}%`} helper="General progress" />
            <SummaryCard icon={<Clock3 className="text-rose-600" size={18} />} label="Employees Not Started" value={Math.max(trainingStats.totalEnrollments - trainingStats.activeTraining - trainingStats.completedTraining, 0)} helper="Not yet started" />
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Training Adoption Overview</h2>
            <div className="space-y-4">
              <AdoptionRow label="Enrolled" value={trainingStats.totalEnrollments} total={Math.max(trainingStats.totalEnrollments, 1)} color="bg-blue-500" />
              <AdoptionRow label="Started" value={trainingStats.activeTraining} total={Math.max(trainingStats.totalEnrollments, 1)} color="bg-violet-500" />
              <AdoptionRow label="In Progress" value={trainingStats.activeTraining} total={Math.max(trainingStats.totalEnrollments, 1)} color="bg-amber-500" />
              <AdoptionRow label="Completed" value={trainingStats.completedTraining} total={Math.max(trainingStats.totalEnrollments, 1)} color="bg-emerald-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Course-wise Adoption</h2>
            {dashboard?.skillCoverage?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Skill</th>
                      <th className="px-4 py-3 font-semibold">Employees Assigned</th>
                      <th className="px-4 py-3 font-semibold">Employees Enrolled</th>
                      <th className="px-4 py-3 font-semibold">Completion Rate</th>
                      <th className="px-4 py-3 font-semibold">Average Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.skillCoverage.map((item) => (
                      <tr key={item.skillName} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{item.skillName}</td>
                        <td className="px-4 py-3">{item.employeeCount}</td>
                        <td className="px-4 py-3">{item.employeesMeetingRequirement}</td>
                        <td className="px-4 py-3">{item.coveragePercentage.toFixed(0)}%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(item.coveragePercentage, 100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{item.coveragePercentage.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                No training adoption records are available for your team right now.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, helper }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-400">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function AdoptionRow({ label, value, total, color }) {
  const width = Math.max((value / total) * 100, 0);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default ManagerTrainingAdoption;
