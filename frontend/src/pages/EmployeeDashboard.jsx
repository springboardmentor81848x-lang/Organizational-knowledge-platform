import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

function EmployeeDashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role="EMPLOYEE" />

      <div className="flex-1">

        <Navbar title="Employee Dashboard" />

        <div className="p-8">

          {/* Welcome */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">
              Welcome Back 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Here's an overview of your learning progress.
            </p>

          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Card */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500">
                    Total Skills
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    12
                  </h2>

                </div>

                <BookOpen
                  size={45}
                  className="text-indigo-600"
                />

              </div>

            </div>

            {/* Card */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500">
                    Courses Completed
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    18
                  </h2>

                </div>

                <GraduationCap
                  size={45}
                  className="text-green-600"
                />

              </div>

            </div>

            {/* Card */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500">
                    Progress
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    82%
                  </h2>

                </div>

                <TrendingUp
                  size={45}
                  className="text-orange-500"
                />

              </div>

            </div>

            {/* Card */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500">
                    Knowledge Gaps
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    3
                  </h2>

                </div>

                <AlertTriangle
                  size={45}
                  className="text-red-500"
                />

              </div>

            </div>

          </div>
                    {/* Skill Progress */}

          <div className="grid lg:grid-cols-2 gap-6 mt-8">

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-bold mb-6">
                Skill Progress
              </h2>

              {[
                { name: "Java", value: 90 },
                { name: "React", value: 70 },
                { name: "Spring Boot", value: 55 },
                { name: "SQL", value: 80 },
              ].map((skill) => (

                <div
                  key={skill.name}
                  className="mb-6"
                >

                  <div className="flex justify-between mb-2">

                    <span>{skill.name}</span>

                    <span>{skill.value}%</span>

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">

                    <div
                      className="bg-indigo-600 h-3 rounded-full"
                      style={{
                        width: `${skill.value}%`,
                      }}
                    ></div>

                  </div>

                </div>

              ))}

            </div>
                        <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-bold mb-5">
                Recommended Learning
              </h2>

              <div className="space-y-4">

                <div className="border rounded-lg p-4">
                  React Advanced
                </div>

                <div className="border rounded-lg p-4">
                  Spring Boot Security
                </div>

                <div className="border rounded-lg p-4">
                  Docker Essentials
                </div>

                <div className="border rounded-lg p-4">
                  Microservices
                </div>

              </div>

            </div>

          </div>
                    <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h2 className="text-xl font-bold mb-5">
              Recent Activity
            </h2>

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">
                    Activity
                  </th>

                  <th className="text-left py-3">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b">

                  <td className="py-3">
                    Completed Java Course
                  </td>

                  <td>Yesterday</td>

                </tr>

                <tr className="border-b">

                  <td className="py-3">
                    Added React Skill
                  </td>

                  <td>2 Days Ago</td>

                </tr>

                <tr>

                  <td className="py-3">
                    SQL Assessment Passed
                  </td>

                  <td>Last Week</td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EmployeeDashboard;