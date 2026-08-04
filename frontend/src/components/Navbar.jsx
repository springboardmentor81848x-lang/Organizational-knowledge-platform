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
        <div className="flex items-center gap-2">

          <UserCircle
            className="text-indigo-600"
            size={35}
          />

          <div>
            <p className="font-semibold text-gray-800">
              Employee
            </p>

            <p className="text-sm text-gray-500">
              Welcome Back
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Navbar;