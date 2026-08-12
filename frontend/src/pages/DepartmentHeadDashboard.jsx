import Sidebar from "../components/Sidebar";

function DepartmentHeadDashboard() {

  const role = localStorage.getItem("role") || "DEPARTMENT_HEAD";

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar role={role} />

      <main className="flex-1 p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Department Head Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor your department's skills, knowledge gaps and employee progress.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">Department Employees</p>
            <h2 className="text-3xl font-bold mt-2">24</h2>
            <p className="text-sm text-gray-400 mt-1">
              Active employees
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">Skill Coverage</p>
            <h2 className="text-3xl font-bold mt-2">78%</h2>
            <p className="text-sm text-green-600 mt-1">
              ↑ 8% this month
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">Training Adoption</p>
            <h2 className="text-3xl font-bold mt-2">64%</h2>
            <p className="text-sm text-green-600 mt-1">
              ↑ 12% this month
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">High-Risk Gaps</p>
            <h2 className="text-3xl font-bold mt-2">7</h2>
            <p className="text-sm text-red-600 mt-1">
              Requires attention
            </p>
          </div>

        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Team Gap Heatmap */}
          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Team Gap Heatmap
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>Java</span>
                <span>🟢 🟢 🟡 🔴</span>
              </div>

              <div className="flex justify-between">
                <span>Spring Boot</span>
                <span>🔴 🟡 🔴 🟢</span>
              </div>

              <div className="flex justify-between">
                <span>SQL</span>
                <span>🟢 🟢 🟡 🟢</span>
              </div>

              <div className="flex justify-between">
                <span>React</span>
                <span>🔴 🟡 🟢 🟢</span>
              </div>

            </div>

          </div>

          {/* Skill Coverage */}
          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Department Skill Coverage
            </h2>

            {[
              ["Java", 82],
              ["Spring Boot", 75],
              ["SQL", 70],
              ["Git", 84],
              ["React", 58],
            ].map(([skill, percentage]) => (

              <div key={skill} className="mb-4">

                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    {skill}
                  </span>

                  <span className="text-sm text-gray-500">
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

              </div>

            ))}

          </div>

        </div>

        {/* High Risk Alerts */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            High-Risk Skill Gap Alerts
          </h2>

          <div className="space-y-3">

            <div className="p-4 bg-red-50 rounded-lg">
              🔴 <strong>Spring Boot</strong> — 5 employees
              below required level
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              🔴 <strong>SQL</strong> — 3 employees
              below required level
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              🟠 <strong>React</strong> — 7 employees
              below required level
            </div>

          </div>

        </div>

        {/* Employee Progress */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Individual Progress Snapshots
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">Employee</th>
                  <th>Progress</th>
                  <th>Skills</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="py-3">Rahul Kumar</td>
                  <td>82%</td>
                  <td>8 / 10</td>
                  <td>🟢 On Track</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Priya Sharma</td>
                  <td>64%</td>
                  <td>6 / 10</td>
                  <td>🟡 Needs Attention</td>
                </tr>

                <tr>
                  <td className="py-3">Arun Kumar</td>
                  <td>48%</td>
                  <td>5 / 10</td>
                  <td>🔴 At Risk</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

export default DepartmentHeadDashboard;