import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  GraduationCap,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  BarChart3,
} from "lucide-react";

import { getTrainingAdoption } from "../services/platformService";

function TrainingAdoption() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD TRAINING ADOPTION
  // ==================================================

  useEffect(() => {
    const employeeIdentifier =
      localStorage.getItem("employeeId");

    console.log(
      "Training Adoption employeeIdentifier:",
      employeeIdentifier
    );

    if (!employeeIdentifier) {
      setError(
        "Department Head information not found. Please login again."
      );
      setLoading(false);
      return;
    }

    const loadTrainingAdoption = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getTrainingAdoption(employeeIdentifier);

        console.log(
          "Training Adoption API response:",
          response
        );

        // Axios response
        const result = response?.data ?? response;

        console.log(
          "Training Adoption data:",
          result
        );

        setData(result);
      } catch (err) {
        console.error(
          "Failed to load training adoption:",
          err
        );

        console.error(
          "Status:",
          err?.response?.status
        );

        console.error(
          "Response:",
          err?.response?.data
        );

        if (err?.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (err?.response?.status === 403) {
          setError(
            "You are not authorized to view Training Adoption."
          );
        } else if (err?.response?.status === 404) {
          setError(
            "Training Adoption endpoint was not found."
          );
        } else {
          setError(
            "Unable to load training adoption data."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadTrainingAdoption();
  }, []);

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">

        <Sidebar role="DEPARTMENT HEAD" />

        <div className="flex-1 min-w-0">

          <Navbar title="Training Adoption" />

          <main className="p-8">

            <div className="flex items-center justify-center h-96">

              <div className="text-center">

                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>

                <p className="text-gray-500 mt-4">
                  Loading training adoption...
                </p>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">

        <Sidebar role="DEPARTMENT HEAD" />

        <div className="flex-1 min-w-0">

          <Navbar title="Training Adoption" />

          <main className="p-8">

            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-red-100 rounded-lg">
                  <BarChart3 size={22} />
                </div>

                <div>
                  <p className="font-semibold">
                    Unable to load Training Adoption
                  </p>

                  <p className="text-sm mt-1">
                    {error}
                  </p>
                </div>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  // ==================================================
  // SAFE DEFAULTS
  // ==================================================

  const courses = data?.courses || [];

  const totalEmployees =
    data?.totalEmployees ?? 0;

  const enrolledEmployees =
    data?.enrolledEmployees ?? 0;

  const adoptionRate =
    data?.adoptionRate ?? 0;

  const totalEnrollments =
    data?.totalEnrollments ?? 0;

  const notStartedEnrollments =
    data?.notStartedEnrollments ?? 0;

  const inProgressEnrollments =
    data?.inProgressEnrollments ?? 0;

  const completedEnrollments =
    data?.completedEnrollments ?? 0;

  const certifiedEnrollments =
    data?.certifiedEnrollments ?? 0;

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar role="DEPARTMENT HEAD" />

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="flex-1 min-w-0">

        {/* ==================================================
            NAVBAR
        ================================================== */}

        <Navbar title="Training Adoption" />

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <main className="p-8">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>

                <h1 className="text-3xl font-bold text-slate-800">
                  Training Adoption
                </h1>

                <p className="text-gray-500 mt-1">
                  Department-wide training participation
                  and learning engagement.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            {/* TOTAL EMPLOYEES */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Total Employees
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalEmployees}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Employees in department
                  </p>

                </div>

                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users
                    size={25}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            {/* ENROLLED EMPLOYEES */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Employees Enrolled
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {enrolledEmployees}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Employees participating
                  </p>

                </div>

                <div className="p-3 bg-green-50 rounded-xl">
                  <BookOpen
                    size={25}
                    className="text-green-600"
                  />
                </div>

              </div>

            </div>

            {/* ADOPTION RATE */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Training Adoption Rate
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {adoptionRate}%
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Department participation
                  </p>

                </div>

                <div className="p-3 bg-purple-50 rounded-xl">
                  <TrendingUp
                    size={25}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              ENROLLMENT STATUS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

            {/* TOTAL */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <BarChart3
                    size={22}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Total Enrollments
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {totalEnrollments}
                  </p>

                </div>

              </div>

            </div>

            {/* NOT STARTED */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-gray-100 rounded-lg">
                  <Clock
                    size={22}
                    className="text-gray-600"
                  />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Not Started
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {notStartedEnrollments}
                  </p>

                </div>

              </div>

            </div>

            {/* IN PROGRESS */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-orange-50 rounded-lg">
                  <PlayCircle
                    size={22}
                    className="text-orange-600"
                  />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    In Progress
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {inProgressEnrollments}
                  </p>

                </div>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-green-50 rounded-lg">
                  <CheckCircle
                    size={22}
                    className="text-green-600"
                  />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Completed
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {completedEnrollments +
                      certifiedEnrollments}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              COURSE ADOPTION TABLE
          ================================================== */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-2.5 bg-blue-50 rounded-lg">
                <GraduationCap
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Training Course Adoption
                </h2>

                <p className="text-sm text-gray-500">
                  Course participation across employees
                  in your department.
                </p>

              </div>

            </div>

            {courses.length === 0 ? (

              <div className="py-14 text-center">

                <GraduationCap
                  size={48}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  No training adoption data
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Training participation will appear
                  here once employees enroll in courses.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-gray-100">

                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Course
                      </th>

                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Skill
                      </th>

                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                        Enrolled
                      </th>

                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                        Completed
                      </th>

                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Adoption
                      </th>

                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Completion
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {courses.map((course) => (

                      <tr
                        key={course.courseId}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >

                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {course.courseTitle}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {course.skillName || "—"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {course.enrolledEmployees}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {course.completedEmployees}
                          </span>
                        </td>

                        {/* ADOPTION */}

                        <td className="py-4 px-4">

                          <div className="min-w-[130px]">

                            <div className="flex items-center justify-between mb-1">

                              <span className="text-sm font-semibold text-gray-700">
                                {course.adoptionPercentage}%
                              </span>

                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2">

                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    course.adoptionPercentage || 0,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        {/* COMPLETION */}

                        <td className="py-4 px-4">

                          <div className="min-w-[130px]">

                            <div className="flex items-center justify-between mb-1">

                              <span className="text-sm font-semibold text-gray-700">
                                {course.completionPercentage}%
                              </span>

                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2">

                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    course.completionPercentage || 0,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* ==================================================
              INFORMATION NOTE
          ================================================== */}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

            <div className="flex gap-3">

              <TrendingUp
                size={20}
                className="text-blue-600 mt-0.5"
              />

              <p className="text-sm text-blue-800">

                Training Adoption measures how actively
                employees in the department participate in
                available training. The adoption rate is based
                on the number of unique employees enrolled in
                at least one training course.

              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default TrainingAdoption;