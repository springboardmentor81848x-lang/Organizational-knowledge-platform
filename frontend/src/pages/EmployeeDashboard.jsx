function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome back! Here is your overview.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">View and update your personal details.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <p className="text-gray-600">Track your current skills and growth areas.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Knowledge Gaps</h2>
            <p className="text-gray-600">Review recommended learning opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
