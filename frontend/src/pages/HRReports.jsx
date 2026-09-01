import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  Download,
  FileText,
  Loader,
  AlertTriangle,
  BarChart3,
  Users,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

export default function HRReports() {
  const [activeTab, setActiveTab] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState({});
  const [employeeData, setEmployeeData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [exporting, setExporting] = useState(false);

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, empRes, deptRes, trainingRes] = await Promise.all([
        api.get("/hr/reports/statistics"),
        api.get("/hr/reports/employee"),
        api.get("/hr/reports/department"),
        api.get("/hr/reports/training-effectiveness"),
      ]);

      setStatistics(statsRes.data || {});
      setEmployeeData(Array.isArray(empRes.data) ? empRes.data : []);
      setDepartmentData(Array.isArray(deptRes.data) ? deptRes.data : []);
      setTrainingData(Array.isArray(trainingRes.data) ? trainingRes.data : []);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Export function
  const handleExport = async (reportType, format) => {
    try {
      setExporting(true);
      const endpoint = `/hr/reports/export/${reportType}/${format}`;
      const response = await api.get(endpoint, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const fileExtension = format === "pdf" ? "pdf" : "xlsx";
      const reportName = reportType.replace("-", "_");
      link.setAttribute("download", `${reportName}_report.${fileExtension}`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting report:", err);
      alert("Failed to export report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Render report table
  const renderTable = (data) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-10 text-slate-500">
          No data available for this report.
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                {headers.map((header) => (
                  <td
                    key={`${index}-${header}`}
                    className="border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  >
                    {row[header] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render statistics cards
  const renderStatistics = () => {
    const stats = [
      {
        label: "Total Employees",
        value: statistics["Total Employees"] || 0,
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      {
        label: "Total Departments",
        value: statistics["Total Departments"] || 0,
        icon: BarChart3,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      {
        label: "Total Trainings",
        value: statistics["Total Trainings Enrolled"] || 0,
        icon: GraduationCap,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
      {
        label: "Completion Rate",
        value: `${statistics["Overall Completion Rate %"] || "0"}%`,
        icon: RefreshCw,
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
    ];

    return stats.map((stat, index) => {
      const Icon = stat.icon;
      return (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <Icon className={`${stat.color}`} size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="HR" />
      <div className="flex-1 min-w-0">
        <Navbar title="HR Reports" />

        <main className="p-5 md:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">HR Reports</h1>
              <p className="text-slate-500 mt-2">
                Generate and export comprehensive reports with employee, department, and training data.
              </p>
            </div>
            <button
              onClick={fetchReportData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {renderStatistics()}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-8 flex items-center gap-3">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Loader className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
                <p className="text-slate-500">Loading report data...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Report Type Selector */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
                  {[
                    { id: "employee", label: "Employee Report", icon: Users },
                    { id: "department", label: "Department Report", icon: BarChart3 },
                    { id: "training", label: "Training Effectiveness", icon: GraduationCap },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 font-medium transition border-b-2 ${
                          activeTab === tab.id
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => {
                      const reportType = activeTab === "training" ? "training-effectiveness" : activeTab;
                      handleExport(reportType, "excel");
                    }}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Download size={18} />
                    {exporting ? "Exporting..." : "Export to Excel"}
                  </button>
                  <button
                    onClick={() => {
                      const reportType = activeTab === "training" ? "training-effectiveness" : activeTab;
                      handleExport(reportType, "pdf");
                    }}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <FileText size={18} />
                    {exporting ? "Exporting..." : "Export to PDF"}
                  </button>
                </div>

                {/* Report Content */}
                <div className="mt-6">
                  {activeTab === "employee" && renderTable(employeeData)}
                  {activeTab === "department" && renderTable(departmentData)}
                  {activeTab === "training" && renderTable(trainingData)}
                </div>
              </div>

              {/* Report Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Report Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Report Type</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {activeTab === "employee" && "Employee Report"}
                      {activeTab === "department" && "Department Report"}
                      {activeTab === "training" && "Training Effectiveness Report"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Total Records</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {activeTab === "employee" && employeeData.length}
                      {activeTab === "department" && departmentData.length}
                      {activeTab === "training" && trainingData.length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Generated At</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Available Formats</p>
                    <p className="text-lg font-semibold text-slate-800">Excel (.xlsx), PDF</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
