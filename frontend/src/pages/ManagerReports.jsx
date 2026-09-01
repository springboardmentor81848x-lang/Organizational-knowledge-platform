import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { BarChart3, Download, FileSpreadsheet, Filter } from "lucide-react";

function ManagerReports() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState("team-skill-gap");

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
        console.error("Error loading manager reports:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Unable to load manager reports."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [managerEmployeeId, token]);

  const reportRows = useMemo(() => {
    if (!dashboard) return [];

    if (selectedReport === "team-skill-gap") {
      return dashboard.skillCoverage || [];
    }

    if (selectedReport === "employee-progress") {
      return dashboard.employeeProgress || [];
    }

    return dashboard.skillCoverage || [];
  }, [dashboard, selectedReport]);

  const exportPdf = () => {
    window.print();
  };

  const exportExcel = () => {
    if (!dashboard) return;

    const csvRows = [
      ["Report Type", selectedReport],
      ["Manager Employee ID", dashboard.managerEmployeeId || ""],
      ["Department", dashboard.departmentName || ""],
      ["Team Size", dashboard.teamSize || 0],
      [""],
      ["Skill", "Employees", "Current Avg", "Required Avg", "Coverage %", "Status"],
      ...(dashboard.skillCoverage || []).map((item) => [
        item.skillName,
        item.employeeCount,
        item.averageCurrentLevel,
        item.averageRequiredLevel,
        item.coveragePercentage,
        item.status,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `manager-report-${selectedReport}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="MANAGER" />
        <div className="flex-1 min-w-0">
          <Navbar title="Reports" />
          <main className="p-6">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-slate-700" />
              <p className="mt-4 text-slate-500">Loading reports...</p>
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
          <Navbar title="Reports" />
          <main className="p-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
              <h2 className="text-xl font-bold">Unable to load Reports</h2>
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
        <Navbar title="Reports" />

        <main className="space-y-6 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Manager Reports</h1>
              <p className="mt-1 text-slate-500">Team performance, training, and skill-gap reporting.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                <Download size={16} /> Export PDF
              </button>
              <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FileSpreadsheet size={16} /> Export Excel
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard icon={<BarChart3 className="text-blue-600" size={18} />} label="Team Size" value={dashboard?.teamSize || 0} helper="Employees in team" />
            <SummaryCard icon={<Filter className="text-violet-600" size={18} />} label="Total Skill Gaps" value={dashboard?.skillGaps || 0} helper="Current skill gap count" />
            <SummaryCard icon={<BarChart3 className="text-emerald-600" size={18} />} label="High-Risk Gaps" value={dashboard?.highRiskGaps || 0} helper="Critical alerts" />
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="team-skill-gap">Team Skill Gap Report</option>
                <option value="employee-progress">Employee Progress Report</option>
                <option value="training-adoption">Training Adoption Report</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Skill</th>
                    <th className="px-4 py-3 font-semibold">Employees</th>
                    <th className="px-4 py-3 font-semibold">Current Avg</th>
                    <th className="px-4 py-3 font-semibold">Required Avg</th>
                    <th className="px-4 py-3 font-semibold">Gap</th>
                    <th className="px-4 py-3 font-semibold">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row.skillName} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.skillName}</td>
                      <td className="px-4 py-3">{row.employeeCount}</td>
                      <td className="px-4 py-3">{Number(row.averageCurrentLevel || 0).toFixed(1)}</td>
                      <td className="px-4 py-3">{Number(row.averageRequiredLevel || 0).toFixed(1)}</td>
                      <td className="px-4 py-3">{Math.max((Number(row.averageRequiredLevel || 0) - Number(row.averageCurrentLevel || 0)), 0).toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(Number(row.coveragePercentage || 0), 100)}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{Number(row.coveragePercentage || 0).toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default ManagerReports;
