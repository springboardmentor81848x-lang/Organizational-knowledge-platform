import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BookOpen,
  ClipboardList,
  LogOut,
} from "lucide-react";

function Sidebar({ role }) {
  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen flex flex-col shadow-lg">

      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">OKIP</h1>
        <p className="text-sm text-blue-200">
          Knowledge Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">

        <NavLink
          to={`/${role.toLowerCase()}`}
          className="flex items-center gap-3 px-6 py-3 hover:bg-blue-700"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-6 py-3 hover:bg-blue-700"
        >
          <User size={20} />
          Profile
        </NavLink>

        <NavLink
          to="/skills"
          className="flex items-center gap-3 px-6 py-3 hover:bg-blue-700"
        >
          <BookOpen size={20} />
          Skills
        </NavLink>

        <NavLink
          to="/knowledge-gap"
          className="flex items-center gap-3 px-6 py-3 hover:bg-blue-700"
        >
          <ClipboardList size={20} />
          Knowledge Gap
        </NavLink>

      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-blue-700">
        <button
          className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;
