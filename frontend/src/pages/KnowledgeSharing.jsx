import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function KnowledgeSharing() {
  const shares = [
    { id: 1, title: "How we migrated to microservices", author: "Alice", date: "2026-07-20" },
    { id: 2, title: "Tips for Spring Boot performance", author: "Bob", date: "2026-06-15" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "EMPLOYEE")} />

      <div className="flex-1">
        <Navbar title="Knowledge Sharing" />

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Knowledge Sharing</h2>

          <div className="grid gap-6">
            {shares.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-500">By {s.author} — {s.date}</p>
                <p className="mt-3">Summary: Brief summary of the knowledge piece goes here. Click to read more.</p>
                <div className="mt-4">
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded">Read</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeSharing;
