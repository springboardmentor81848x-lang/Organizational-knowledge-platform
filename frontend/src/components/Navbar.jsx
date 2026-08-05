import { UserCircle } from "lucide-react";

function Navbar({ title }) {
  return (
    <div className="bg-white shadow flex justify-between items-center px-8 py-4">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <UserCircle
          className="text-indigo-600"
          size={35}
        />
      </div>

    </div>
  );
}

export default Navbar;