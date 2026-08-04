import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function KnowledgeGap() {
  const gaps = [
    { id: 1, title: "Spring Security basics", impact: "High", recommendation: "Complete Spring Security course" },
    { id: 2, title: "Docker workflows", impact: "Medium", recommendation: "Take Docker Essentials" },
    { id: 3, title: "Advanced SQL tuning", impact: "Low", recommendation: "Read SQL performance guide" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "EMPLOYEE")} />

      <div className="flex-1">
        <Navbar title="Knowledge Gaps" />

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Identified Knowledge Gaps</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {gaps.map((g) => (
              <div key={g.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{g.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Impact: {g.impact}</p>
                  </div>

                  <div>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{g.impact}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p>{g.recommendation}</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded">Start Learning</button>
                  <button className="px-3 py-2 border rounded">View Resources</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGap;
