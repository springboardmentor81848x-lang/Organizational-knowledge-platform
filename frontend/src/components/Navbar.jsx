import { UserCircle } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";

function Navbar({ title }) {
  return (
    <div className="bg-white dark:bg-slate-900 shadow flex justify-between items-center px-8 py-4">

      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <UserCircle
          className="text-indigo-600"
          size={35}
        />
      </div>

    </div>
  );
}

export default Navbar;