import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Notifications() {
  const notifications = [
    { id: 1, text: "New course available: Spring Security", time: "2h ago" },
    { id: 2, text: "HR approved your learning request", time: "1 day ago" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "ADMIN")} />

      <div className="flex-1">
        <Navbar title="Notifications" />

        <div className="p-8">
          <div className="bg-white rounded-xl shadow p-6 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
            <ul className="space-y-4">
              {notifications.map((n) => (
                <li key={n.id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <div>{n.text}</div>
                    <div className="text-sm text-gray-500">{n.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
