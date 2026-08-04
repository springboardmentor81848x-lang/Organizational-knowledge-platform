import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  Building2,
  UserCheck,
  AlertCircle,
} from "lucide-react";

function HRDashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role="HR" />

      <div className="flex-1">

        <Navbar title="HR Dashboard" />

        <div className="p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              HR Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage employees and monitor organizational skills.
            </p>
          </div>

          {/* Statistics */}

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">Employees</p>
                  <h2 className="text-3xl font-bold mt-3">128</h2>
                </div>

                <Users size={45} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">Departments</p>
                  <h2 className="text-3xl font-bold mt-3">8</h2>
                </div>

                <Building2 size={45} className="text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">Managers</p>
                  <h2 className="text-3xl font-bold mt-3">14</h2>
                </div>

                <UserCheck size={45} className="text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">Knowledge Gaps</p>
                  <h2 className="text-3xl font-bold mt-3">22</h2>
                </div>

                <AlertCircle size={45} className="text-red-500" />
              </div>
            </div>

          </div>

          {/* Employee Table */}

          <div className="bg-white rounded-xl shadow mt-8 p-6">

            <h2 className="text-xl font-bold mb-5">
              Recent Employees
            </h2>

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">Employee</th>
                  <th className="text-left py-3">Role</th>
                  <th className="text-left py-3">Designation</th>
                  <th className="text-left py-3">Status</th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="py-3">Rahul</td>
                  <td>Employee</td>
                  <td>Java Developer</td>
                  <td className="text-green-600">Active</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Priya</td>
                  <td>Manager</td>
                  <td>Project Manager</td>
                  <td className="text-green-600">Active</td>
                </tr>

                <tr>
                  <td className="py-3">Kiran</td>
                  <td>Employee</td>
                  <td>Frontend Developer</td>
                  <td className="text-yellow-500">On Leave</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Skill Overview */}

          <div className="bg-white rounded-xl shadow mt-8 p-6">

            <h2 className="text-xl font-bold mb-5">
              Skill Distribution
            </h2>

            {[
              { skill: "Java", percent: 80 },
              { skill: "React", percent: 65 },
              { skill: "Spring Boot", percent: 60 },
              { skill: "SQL", percent: 75 },
            ].map((item) => (

              <div key={item.skill} className="mb-5">

                <div className="flex justify-between mb-2">

                  <span>{item.skill}</span>

                  <span>{item.percent}%</span>

                </div>

                <div className="bg-gray-200 rounded-full h-3">

                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default HRDashboard;