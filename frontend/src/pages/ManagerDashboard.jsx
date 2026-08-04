import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  Briefcase,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";

function ManagerDashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role="MANAGER" />

      <div className="flex-1">

        <Navbar title="Manager Dashboard" />

        <div className="p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Manager Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor your team's performance and project progress.
            </p>
          </div>

          {/* Statistics */}

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Team Members</p>
                  <h2 className="text-3xl font-bold mt-2">18</h2>
                </div>

                <Users size={45} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Projects</p>
                  <h2 className="text-3xl font-bold mt-2">6</h2>
                </div>

                <Briefcase size={45} className="text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Completed Tasks</p>
                  <h2 className="text-3xl font-bold mt-2">152</h2>
                </div>

                <ClipboardCheck size={45} className="text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Knowledge Gaps</p>
                  <h2 className="text-3xl font-bold mt-2">7</h2>
                </div>

                <AlertTriangle size={45} className="text-red-500" />
              </div>
            </div>

          </div>

          {/* Team Performance */}

          <div className="bg-white rounded-xl shadow mt-8 p-6">

            <h2 className="text-xl font-bold mb-5">
              Team Performance
            </h2>

            {[
              { name: "Rahul", score: 90 },
              { name: "Anjali", score: 80 },
              { name: "Kiran", score: 70 },
              { name: "Priya", score: 95 },
            ].map((member) => (

              <div key={member.name} className="mb-5">

                <div className="flex justify-between mb-2">

                  <span>{member.name}</span>

                  <span>{member.score}%</span>

                </div>

                <div className="bg-gray-200 rounded-full h-3">

                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${member.score}%` }}
                  ></div>

                </div>

              </div>

            ))}

          </div>

          {/* Ongoing Projects */}

          <div className="bg-white rounded-xl shadow mt-8 p-6">

            <h2 className="text-xl font-bold mb-5">
              Ongoing Projects
            </h2>

            <table className="w-full">

              <thead>

                <tr className="border-b">
                  <th className="text-left py-3">Project</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Completion</th>
                </tr>

              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="py-3">Knowledge Platform</td>
                  <td>In Progress</td>
                  <td className="text-blue-600">70%</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Employee Portal</td>
                  <td>Testing</td>
                  <td className="text-green-600">90%</td>
                </tr>

                <tr>
                  <td className="py-3">Analytics Dashboard</td>
                  <td>Planning</td>
                  <td className="text-yellow-500">20%</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ManagerDashboard;