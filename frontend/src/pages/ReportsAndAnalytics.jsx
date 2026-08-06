import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function ReportsAndAnalytics() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "ADMIN")} />

      <div className="flex-1">
        <Navbar title="Reports & Analytics" />

        <div className="p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
            <p className="text-gray-600 mb-4">Overview of organizational learning metrics and downloadable reports.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded p-4">
                <h3 className="font-semibold">Export Reports</h3>
                <p className="text-sm text-gray-500">Download CSV or PDF reports for HR analysis.</p>
                <div className="mt-3">
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded">Export CSV</button>
                </div>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-semibold">Trend Analysis</h3>
                <p className="text-sm text-gray-500">View trends for skills over time.</p>
                <div className="mt-3">
                  <button className="px-3 py-2 border rounded">View Charts</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsAndAnalytics;
