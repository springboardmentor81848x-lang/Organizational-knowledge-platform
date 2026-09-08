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

        // API response
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

        <div className="min-w-0 flex-1">
          <Navbar title="Training Adoption" />

          <main className="p-8">
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />

                <p className="mt-4 text-gray-500">
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

        <div className="min-w-0 flex-1">
          <Navbar title="Training Adoption" />

          <main className="p-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <BarChart3 size={22} />
                </div>

                <div>
                  <p className="font-semibold">
                    Unable to load Training Adoption
                  </p>

                  <p className="mt-1 text-sm">
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

      <div className="min-w-0 flex-1">
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
              <div className="rounded-xl bg-blue-100 p-3">
                <GraduationCap
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Training Adoption
                </h1>

                <p className="mt-1 text-gray-500">
                  Department-wide training participation
                  and learning engagement.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* TOTAL EMPLOYEES */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Employees
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {totalEmployees}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Employees in department
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3">
                  <Users
                    size={25}
                    className="text-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* ENROLLED EMPLOYEES */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Employees Enrolled
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {enrolledEmployees}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Employees participating
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3">
                  <BookOpen
                    size={25}
                    className="text-green-600"
                  />
                </div>
              </div>
            </div>

            {/* ADOPTION RATE */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Training Adoption Rate
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {adoptionRate}%
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Department participation
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50 p-3">
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

          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
            {/* TOTAL */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5">
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

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2.5">
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

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2.5">
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

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5">
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

          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Course
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Skill
                      </th>

                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        Enrolled
                      </th>

                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        Completed
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Adoption
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
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
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">
                            {course.courseTitle}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {course.skillName || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {course.enrolledEmployees}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {course.completedEmployees}
                          </span>
                        </td>

                        {/* ADOPTION */}

                        <td className="px-4 py-4">
                          <div className="min-w-[130px]">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">
                                {course.adoptionPercentage}%
                              </span>
                            </div>

                            <div className="h-2 w-full rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full bg-blue-600"
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

                        <td className="px-4 py-4">
                          <div className="min-w-[130px]">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">
                                {course.completionPercentage}%
                              </span>
                            </div>

                            <div className="h-2 w-full rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full bg-green-500"
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

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <TrendingUp
                size={20}
                className="mt-0.5 text-blue-600"
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