import api from "../services/api";

import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";

import { Eye, EyeOff, GitBranch, Mail } from "lucide-react";

import InputField from "../components/InputField";

import Button from "../components/Button";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login Success:", response.data);

      // (storage + navigation logic unchanged)
      localStorage.removeItem("targetRoleId");
      localStorage.removeItem("targetRole");
      localStorage.removeItem("targetAssessmentId");

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data.id != null) {
        localStorage.setItem("userId", response.data.id.toString());
      }

      if (response.data.designation) {
        localStorage.setItem("designation", response.data.designation);
      }

      if (response.data.firstName) {
        localStorage.setItem("firstName", response.data.firstName);
      }

      if (response.data.lastName) {
        localStorage.setItem("lastName", response.data.lastName);
      }

      if (response.data.employeeId) {
        localStorage.setItem("employeeId", response.data.employeeId);
      }

      if (response.data.targetRoleId != null) {
        const targetRoleId = Number(response.data.targetRoleId);
        localStorage.setItem("targetRoleId", targetRoleId.toString());
        const targetRoles = {
          1: "Software Developer",
          2: "Software Tester",
          3: "Data Analyst",
          4: "Data Scientist",
          5: "DevOps Engineer",
          6: "UI/UX Designer",
          7: "Cybersecurity Analyst",
          8: "Database Administrator",
        };
        const targetRoleName = targetRoles[targetRoleId];
        if (targetRoleName) localStorage.setItem("targetRole", targetRoleName);
      }

      let role = response.data.role;
      if (role && typeof role === "object") role = role.roleName;

      if (!role && response.data.token) {
        try {
          const tokenParts = response.data.token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            role = payload.role || payload.roles || payload.authorities || payload.authority;
          }
        } catch (tokenError) {
          console.warn("Unable to parse role from token:", tokenError);
        }
      }

      if (Array.isArray(role)) role = role[0];

      const normalizedRole = role?.toString().trim().toUpperCase().replace(/[\s-]+/g, "_");
      if (normalizedRole) localStorage.setItem("role", normalizedRole);

      switch (normalizedRole) {
        case "EMPLOYEE":
          navigate("/employee");
          break;

        case "HR":
        case "HR_ADMIN":
          navigate("/hr");
          break;

        case "MANAGER":
          navigate("/manager");
          break;

        case "DEPARTMENT_HEAD":
          navigate("/department-head");
          break;

        case "MENTOR":
          navigate("/mentor");
          break;

        case "SYSTEM_ADMINISTRATOR":
        case "SYSTEM_ADMIN":
          navigate("/system-administrator");
          break;

        default:
          alert(`Unknown role: ${role || "No role received"}`);
          break;
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        alert(error.response.data?.message || "Invalid email or password");
      } else {
        alert("Cannot connect to server");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2 bg-white dark:bg-slate-800 hover:shadow-2xl transform hover:-translate-y-1 transition-transform duration-300">

        {/* LEFT: Gradient + Illustration */}
        <div className="hidden md:flex flex-col justify-center p-10 gap-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <div className="max-w-xs">
            <h1 className="text-4xl font-extrabold">Organizational Knowledge</h1>
            <p className="mt-3 text-slate-100/90">Empowering organizations through knowledge sharing, skill management, and intelligent insights.</p>
          </div>

          <div className="mt-6 opacity-90">
            {/* Simple abstract illustration */}
            <svg width="260" height="180" viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="120" height="100" rx="16" fill="rgba(255,255,255,0.08)" />
              <circle cx="190" cy="60" r="40" fill="rgba(255,255,255,0.06)" />
              <path d="M40 150 C80 120, 140 120, 180 150" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* RIGHT: Form Card */}
        <div className="p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to access your dashboard</p>

            {/* Social buttons */}
            <div className="flex gap-3 mb-6">
              <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 border rounded-lg px-4 py-2 bg-white dark:bg-slate-700 transform hover:-translate-y-1 hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <GitBranch size={18} />
                <span className="text-sm">Continue with GitHub</span>
              </button>

              <button type="button" className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 bg-white dark:bg-slate-700 transform hover:-translate-y-1 hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <Mail size={18} />
                <span className="text-sm">Email</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              <div className="text-xs text-gray-400">or</div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <InputField label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />

              <div>
                <label className="block mb-2 font-medium text-sm">Password</label>
                <div className="flex border rounded-lg overflow-hidden items-center">
                  <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 px-4 py-3 outline-none bg-white dark:bg-slate-700" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 bg-gray-50 dark:bg-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <input type="checkbox" className="accent-indigo-600" />
                  Remember me
                </label>

                <Link to="/forgot-password" className="text-indigo-600 hover:underline text-sm">Forgot?</Link>
              </div>

              <Button text="Sign in" type="submit" />
            </form>

            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-300">Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold">Create one</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;