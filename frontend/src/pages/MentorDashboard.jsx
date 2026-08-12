import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MentorDashboard() {
  const metrics = {
    totalEmployeeSkillScore: 78, // average score
    activeLearners: 124,
    criticalSkillGaps: 7,
    organizationalPerformance: 86, // percent
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "ADMIN")} />

      <div className="flex-1">
        <Navbar title="Mentor Dashboard" />

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Organizational Overview</h1>
            <p className="text-gray-500 mt-2">Key metrics for learning and performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500">Total Employee Skill Score</p>
              <h2 className="text-3xl font-bold mt-3">{metrics.totalEmployeeSkillScore}</h2>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500">Active Learners</p>
              <h2 className="text-3xl font-bold mt-3">{metrics.activeLearners}</h2>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500">Critical Skill Gaps</p>
              <h2 className="text-3xl font-bold mt-3">{metrics.criticalSkillGaps}</h2>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500">Organizational Performance</p>
              <h2 className="text-3xl font-bold mt-3">{metrics.organizationalPerformance}%</h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-3">Top Critical Gaps</h2>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Spring Security fundamentals</li>
                <li>Microservices observability</li>
                <li>Database performance tuning</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-3">Organizational Performance Breakdown</h2>
              <p className="text-gray-600">Average completion rates, assessment pass rates, and course engagement.</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-600 h-4 rounded-full" style={{ width: `${metrics.organizationalPerformance}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
