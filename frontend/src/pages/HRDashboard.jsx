import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import api from "../services/api";

function HRDashboard() {

  const [dashboard, setDashboard] = useState({
    totalEmployees: 0,
    employeesWithGaps: 0,
    averageGap: 0,
    criticalGaps: 0,
    totalKnowledgeGaps: 0,

    performance: {
      excellent: 0,
      good: 0,
      needsAttention: 0,
      critical: 0,
    },

    gapDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },

    topSkillGaps: [],
    employees: [],
  });

  const [loading, setLoading] = useState(true);


  // =========================================================
  // Load HR Dashboard Data
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  const loadDashboard = async () => {

    try {

      const response =
        await api.get("/hr/dashboard/summary");

      console.log(
        "HR Dashboard Data:",
        response.data
      );

      setDashboard(response.data);

    } catch (error) {

      console.error(
        "Error loading HR dashboard:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // Loading
  // =========================================================

  if (loading) {

    return (
      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar role="HR" />

        <div className="flex-1">

          <Navbar title="HR Dashboard" />

          <div className="p-8">

            <p className="text-gray-500">
              Loading HR dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =========================================================
  // Dashboard
  // =========================================================

  return (

    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role="HR" />

      <div className="flex-1">

        <Navbar title="HR Dashboard" />

        <div className="p-8">


          {/* =================================================
              Header
          ================================================= */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">
              HR Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Organization Skill & Knowledge Gap Overview
            </p>

          </div>


          {/* =================================================
              Summary Cards
          ================================================= */}

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">


            {/* Total Employees */}

            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Total Employees
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {dashboard.totalEmployees}
                  </h2>

                </div>

                <Users
                  size={42}
                  className="text-indigo-600"
                />

              </div>

            </div>


            {/* Employees With Gaps */}

            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Employees With Gaps
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {dashboard.employeesWithGaps}
                  </h2>

                </div>

                <UserCheck
                  size={42}
                  className="text-orange-500"
                />

              </div>

            </div>


            {/* Average Gap */}

            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Avg Knowledge Gap
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {dashboard.averageGap}
                  </h2>

                </div>

                <TrendingUp
                  size={42}
                  className="text-blue-600"
                />

              </div>

            </div>


            {/* Critical Employees */}

          <div className="bg-white rounded-xl shadow-sm p-6">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500 text-sm">
                  Critical Employees
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {dashboard.performance.critical}
                </h2>

              </div>

              <AlertCircle
                size={42}
                className="text-red-500"
              />

            </div>

          </div>
          </div>
          {/* =================================================
              Employee Performance + Gap Distribution
          ================================================= */}

          <div className="grid lg:grid-cols-2 gap-6 mt-8">


            {/* Employee Performance */}

            <div className="bg-white rounded-xl shadow-sm p-6">

              <h2 className="text-xl font-bold mb-6">
                Employee Performance
              </h2>


              <PerformanceBar
                label="Excellent"
                value={
                  dashboard.performance.excellent
                }
                total={
                  dashboard.totalEmployees
                }
              />


              <PerformanceBar
                label="Good"
                value={
                  dashboard.performance.good
                }
                total={
                  dashboard.totalEmployees
                }
              />


              <PerformanceBar
                label="Needs Attention"
                value={
                  dashboard.performance.needsAttention
                }
                total={
                  dashboard.totalEmployees
                }
              />


              <PerformanceBar
                label="Critical"
                value={
                  dashboard.performance.critical
                }
                total={
                  dashboard.totalEmployees
                }
              />

            </div>


            {/* Knowledge Gap Distribution */}

            <div className="bg-white rounded-xl shadow-sm p-6">

              <h2 className="text-xl font-bold mb-6">
                Knowledge Gap Distribution
              </h2>


              <GapBar
                label="Low"
                value={
                  dashboard.gapDistribution.low
                }
                total={
                  dashboard.totalKnowledgeGaps
                }
              />


              <GapBar
                label="Medium"
                value={
                  dashboard.gapDistribution.medium
                }
                total={
                  dashboard.totalKnowledgeGaps
                }
              />


              <GapBar
                label="High"
                value={
                  dashboard.gapDistribution.high
                }
                total={
                  dashboard.totalKnowledgeGaps
                }
              />


              <GapBar
                label="Critical"
                value={
                  dashboard.gapDistribution.critical
                }
                total={
                  dashboard.totalKnowledgeGaps
                }
              />

            </div>

          </div>


          {/* =================================================
              Top Skills With Knowledge Gaps
          ================================================= */}

          <div className="bg-white rounded-xl shadow-sm mt-8 p-6">

            <h2 className="text-xl font-bold mb-6">
              Top Skills With Knowledge Gaps
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">
                      Skill
                    </th>

                    <th className="text-left py-3">
                      Employees Affected
                    </th>

                    <th className="text-left py-3">
                      Average Gap
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {dashboard.topSkillGaps.length > 0 ? (

                    dashboard.topSkillGaps.map(
                      (item, index) => (

                        <tr
                          key={index}
                          className="border-b"
                        >

                          <td className="py-4 font-medium">
                            {item.skill}
                          </td>

                          <td className="py-4">
                            {item.employeesAffected}
                          </td>

                          <td className="py-4 font-semibold">
                            {item.averageGap}
                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="3"
                        className="text-center py-6 text-gray-500"
                      >
                        No knowledge gaps found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>


          {/* =================================================
              Employee Skill Overview
          ================================================= */}

          <div className="bg-white rounded-xl shadow-sm mt-8 p-6">

            <h2 className="text-xl font-bold mb-6">
              Employee Skill Overview
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">
                      Employee
                    </th>

                    <th className="text-left py-3">
                      Designation
                    </th>

                    <th className="text-left py-3">
                      Avg Skill
                    </th>

                    <th className="text-left py-3">
                      Gap Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {dashboard.employees.length > 0 ? (

                    dashboard.employees.map(
                      (employee, index) => (

                        <tr
                          key={
                            employee.employeeId ||
                            index
                          }
                          className="border-b hover:bg-gray-50"
                        >


                          {/* Employee */}

                          <td className="py-4 font-medium">
                            {employee.employee}
                          </td>


                          {/* Designation */}

                          <td className="py-4">
                            {employee.designation ||
                              "Not Assigned"}
                          </td>


                          {/* Average Skill */}

                          <td className="py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">

                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      employee.averageSkill,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-sm font-medium">
                                {
                                  employee.averageSkill
                                }%
                              </span>

                            </div>

                          </td>


                          {/* Gap Status */}

                          <td className="py-4">

                            <GapStatus
                              status={
                                employee.gapStatus
                              }
                            />

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        className="text-center py-6 text-gray-500"
                      >
                        No employee data available.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>


        </div>

      </div>

    </div>

  );
}


/* =========================================================
   Performance Bar
========================================================= */

function PerformanceBar({
  label,
  value,
  total,
}) {

  const percentage =
    total > 0
      ? Math.min(
          (value / total) * 100,
          100
        )
      : 0;


  return (

    <div className="mb-5">

      <div className="flex justify-between mb-2">

        <span className="font-medium">
          {label}
        </span>

        <span className="text-gray-500">
          {value}
        </span>

      </div>


      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">

        <div
          className="bg-indigo-600 h-3 rounded-full"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>

  );
}


/* =========================================================
   Knowledge Gap Bar
========================================================= */

function GapBar({
  label,
  value,
  total,
}) {

  /*
   * IMPORTANT:
   * Use totalKnowledgeGaps as denominator.
   *
   * Example:
   * Low = 2
   * Medium = 4
   * Total = 6
   *
   * Medium = 4 / 6 = 66.7%
   */

  const percentage =
    total > 0
      ? Math.min(
          (value / total) * 100,
          100
        )
      : 0;


  return (

    <div className="mb-5">

      <div className="flex justify-between mb-2">

        <span className="font-medium">
          {label}
        </span>

        <span className="text-gray-500">
          {value}
        </span>

      </div>


      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">

        <div
          className="bg-orange-500 h-3 rounded-full"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>

  );
}


/* =========================================================
   Gap Status
========================================================= */

function GapStatus({ status }) {

  let className =
    "px-3 py-1 rounded-full text-sm font-medium";


  if (status === "Low") {

    className +=
      " bg-green-100 text-green-700";

  } else if (status === "Medium") {

    className +=
      " bg-yellow-100 text-yellow-700";

  } else if (status === "High") {

    className +=
      " bg-orange-100 text-orange-700";

  } else {

    className +=
      " bg-red-100 text-red-700";

  }


  return (

    <span className={className}>
      {status}
    </span>

  );

}


export default HRDashboard;