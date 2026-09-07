import React from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  BarChart3,
  GraduationCap,
  Bell,
  LogOut,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  FileText,
  Activity,
} from "lucide-react";

// ==================================================
// DEPARTMENT HEAD REPORTS
// ==================================================

function Reports() {
  // ==================================================
  // SIDEBAR NAVIGATION STYLE
  // ==================================================

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3 transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-200 hover:bg-slate-800"
    }`;

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("designation");

    window.location.href = "/login";
  };

  // ==================================================
  // REPORT DATA
  // ==================================================
  // These values can later be connected to your
  // Department Head backend APIs.
  // ==================================================

  const reportStats = [
    {
      title: "Total Employees",
      value: "48",
      description: "Employees in department",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Skill Coverage",
      value: "76%",
      description: "Overall required skill coverage",
      icon: Target,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Training Adoption",
      value: "68%",
      description: "Employees participating in training",
      icon: GraduationCap,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Critical Skill Gaps",
      value: "9",
      description: "High-priority gaps identified",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  // ==================================================
  // SKILL REPORT
  // ==================================================

  const skillReport = [
    {
      skill: "Java",
      required: 5,
      average: 4.2,
      coverage: 84,
      status: "Good",
    },
    {
      skill: "Python",
      required: 4,
      average: 3.6,
      coverage: 72,
      status: "Moderate",
    },
    {
      skill: "SQL",
      required: 4,
      average: 3.8,
      coverage: 76,
      status: "Good",
    },
    {
      skill: "React",
      required: 4,
      average: 3.1,
      coverage: 62,
      status: "Needs Attention",
    },
    {
      skill: "Cloud Computing",
      required: 4,
      average: 2.7,
      coverage: 54,
      status: "Critical",
    },
  ];

  // ==================================================
  // TRAINING REPORT
  // ==================================================

  const trainingReport = [
    {
      category: "Technical Training",
      enrolled: 32,
      completed: 22,
      progress: 69,
    },
    {
      category: "Soft Skills",
      enrolled: 25,
      completed: 19,
      progress: 76,
    },
    {
      category: "Cloud & DevOps",
      enrolled: 20,
      completed: 11,
      progress: 55,
    },
    {
      category: "Security Training",
      enrolled: 18,
      completed: 14,
      progress: 78,
    },
  ];

  // ==================================================
  // GAP REPORT
  // ==================================================

  const gapReport = [
    {
      skill: "Cloud Computing",
      employees: 12,
      severity: "Critical",
    },
    {
      skill: "React",
      employees: 9,
      severity: "High",
    },
    {
      skill: "DevOps",
      employees: 7,
      severity: "High",
    },
    {
      skill: "Data Analysis",
      employees: 5,
      severity: "Medium",
    },
  ];

  // ==================================================
  // RETURN UI
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ==================================================
          DEPARTMENT HEAD SIDEBAR
      ================================================== */}

      <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

        {/* ==================================================
            LOGO
        ================================================== */}

        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold leading-tight">
            ORGANIZATIONAL KNOWLEDGE GAP
            <br />
            INTELLIGENCE PLATFORM
          </h1>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">

  {/* Department Dashboard */}
  <NavLink
    to="/department-head"
    className={navLinkClass}
  >
    <LayoutDashboard size={20} />
    Department Dashboard
  </NavLink>

  {/* Skill Coverage */}
  <NavLink
    to="/department-head/skill-coverage"
    className={navLinkClass}
  >
    <Users size={20} />
    Skill Coverage
  </NavLink>

  {/* Training Adoption */}
  <NavLink
    to="/department-head/training-adoption"
    className={navLinkClass}
  >
    <GraduationCap size={20} />
    Training Adoption
  </NavLink>

  {/* Reports */}
  <NavLink
    to="/reports"
    className={navLinkClass}
  >
    <BarChart3 size={20} />
    Reports
  </NavLink>

  {/* Notifications */}
  <NavLink
    to="/department-head/notifications"
    className={navLinkClass}
  >
    <Bell size={20} />
    Notifications
  </NavLink>

</nav>

        {/* ==================================================
            LOGOUT
        ================================================== */}

        <div className="p-6 border-t border-slate-700">

          <button
            className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="flex-1 p-8 overflow-y-auto">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Department Reports
            </h1>

            <p className="text-slate-500 mt-1">
              Analyze department skill coverage, training adoption,
              and knowledge gaps.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
            <FileText size={18} className="text-indigo-600" />

            <span className="text-sm font-medium text-slate-700">
              Department Analytics
            </span>
          </div>

        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

          {reportStats.map((stat, index) => {

            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-500">
                      {stat.title}
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {stat.value}
                    </h2>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${stat.iconBg}`}
                  >
                    <Icon
                      size={24}
                      className={stat.iconColor}
                    />
                  </div>

                </div>

                <p className="text-xs text-slate-400 mt-4">
                  {stat.description}
                </p>

              </div>
            );

          })}

        </div>

        {/* ==================================================
            SKILL COVERAGE REPORT
        ================================================== */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Skill Coverage Report
                </h2>

                <p className="text-sm text-slate-500">
                  Current department skill levels compared with requirements.
                </p>
              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Skill
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                    Required Level
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                    Average Level
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                    Coverage
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {skillReport.map((item, index) => (

                  <tr
                    key={index}
                    className="border-t border-slate-100"
                  >

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.skill}
                    </td>

                    <td className="px-6 py-4 text-center text-slate-600">
                      Level {item.required}
                    </td>

                    <td className="px-6 py-4 text-center text-slate-600">
                      {item.average}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex-1 bg-slate-200 rounded-full h-2">

                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${item.coverage}%`,
                            }}
                          />

                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          {item.coverage}%
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-center">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Good"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Needs Attention"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* ==================================================
            TRAINING + GAP REPORTS
        ================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* ==================================================
              TRAINING REPORT
          ================================================== */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap
                    size={20}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Training Report
                  </h2>

                  <p className="text-sm text-slate-500">
                    Training enrollment and completion.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6 space-y-6">

              {trainingReport.map((item, index) => (

                <div key={index}>

                  <div className="flex justify-between mb-2">

                    <span className="text-sm font-medium text-slate-700">
                      {item.category}
                    </span>

                    <span className="text-sm text-slate-500">
                      {item.completed}/{item.enrolled}
                    </span>

                  </div>

                  <div className="bg-slate-200 rounded-full h-2">

                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${item.progress}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-1">

                    <span className="text-xs text-slate-400">
                      Completion
                    </span>

                    <span className="text-xs font-medium text-slate-600">
                      {item.progress}%
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* ==================================================
              KNOWLEDGE GAP REPORT
          ================================================== */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Knowledge Gap Report
                  </h2>

                  <p className="text-sm text-slate-500">
                    Skills requiring department attention.
                  </p>
                </div>

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              {gapReport.map((item, index) => (

                <div
                  key={index}
                  className="p-5 flex items-center justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle
                        size={18}
                        className="text-red-500"
                      />
                    </div>

                    <div>

                      <p className="font-medium text-slate-800">
                        {item.skill}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.employees} employees affected
                      </p>

                    </div>

                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.severity === "Critical"
                        ? "bg-red-100 text-red-700"
                        : item.severity === "High"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.severity}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* ==================================================
            DEPARTMENT PERFORMANCE
        ================================================== */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-2 bg-green-100 rounded-lg">
              <Activity
                size={20}
                className="text-green-600"
              />
            </div>

            <div>

              <h2 className="text-xl font-semibold text-slate-800">
                Department Performance
              </h2>

              <p className="text-sm text-slate-500">
                Overall learning and workforce development indicators.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Skill Improvement */}

            <div className="border border-slate-200 rounded-xl p-5">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Skill Improvement
                </span>

                <TrendingUp
                  size={20}
                  className="text-green-600"
                />

              </div>

              <p className="text-2xl font-bold text-slate-800 mt-3">
                +18%
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Compared with previous assessment cycle
              </p>

            </div>

            {/* Course Completion */}

            <div className="border border-slate-200 rounded-xl p-5">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Course Completion
                </span>

                <CheckCircle
                  size={20}
                  className="text-green-600"
                />

              </div>

              <p className="text-2xl font-bold text-slate-800 mt-3">
                71%
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Department-wide training completion
              </p>

            </div>

            {/* Learning Velocity */}

            <div className="border border-slate-200 rounded-xl p-5">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Learning Velocity
                </span>

                <Clock
                  size={20}
                  className="text-indigo-600"
                />

              </div>

              <p className="text-2xl font-bold text-slate-800 mt-3">
                3.4
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Average modules completed per month
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            REPORT FOOTER
        ================================================== */}

        <div className="mt-8 text-center text-sm text-slate-400">

          Department Head Reports • Organizational Knowledge
          Gap Intelligence Platform

        </div>

      </main>

    </div>
  );
}

export default Reports;