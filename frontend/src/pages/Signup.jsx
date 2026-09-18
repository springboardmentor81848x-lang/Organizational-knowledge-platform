import api from "../services/api";

import Button from "../components/Button";

import InputField from "../components/InputField";

import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";

import { Eye, EyeOff, GitBranch, Mail } from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    designation: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "EMPLOYEE",
    targetRole: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !formData.employeeId ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.designation ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (formData.role === "EMPLOYEE" && !formData.targetRole) {
      alert("Please select a Target Role.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const signupPayload = {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        targetRole: formData.role === "EMPLOYEE" ? formData.targetRole : null,
      };

      const response = await api.post("/auth/signup", signupPayload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Signup Successful!");

      localStorage.removeItem("targetRole");
      localStorage.removeItem("targetRoleId");
      localStorage.removeItem("targetAssessmentId");

      if (response.data.token) localStorage.setItem("token", response.data.token);
      if (response.data.role) localStorage.setItem("role", response.data.role);
      if (response.data.firstName) localStorage.setItem("firstName", response.data.firstName);
      if (response.data.lastName) localStorage.setItem("lastName", response.data.lastName);
      if (response.data.employeeId) localStorage.setItem("employeeId", response.data.employeeId);
      if (response.data.designation) localStorage.setItem("designation", response.data.designation);

      if (formData.role === "EMPLOYEE" && formData.targetRole) {
        localStorage.setItem("targetRole", formData.targetRole);
        if (response.data.targetRoleId !== null && response.data.targetRoleId !== undefined) {
          localStorage.setItem("targetRoleId", response.data.targetRoleId.toString());
        }
      }

      setFormData({
        employeeId: "",
        firstName: "",
        lastName: "",
        designation: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "EMPLOYEE",
        targetRole: "",
      });

      navigate("/employee");
    } catch (error) {
      console.error("Signup error:", error);
      const responseData = error.response?.data;
      const errorMessage = responseData?.message || responseData?.error || (typeof responseData === "string" ? responseData : null) || error.message || "Signup failed";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2 bg-white dark:bg-slate-800 hover:shadow-2xl transform hover:-translate-y-1 transition-transform duration-300">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center p-10 gap-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <div className="max-w-xs">
            <h1 className="text-4xl font-extrabold">Organizational Knowledge</h1>
            <p className="mt-3 text-slate-100/90">Join the platform to manage skills and collaborate across teams.</p>
          </div>

          <div className="mt-6 opacity-90">
            <svg width="260" height="180" viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="120" height="100" rx="16" fill="rgba(255,255,255,0.08)" />
              <circle cx="190" cy="60" r="40" fill="rgba(255,255,255,0.06)" />
              <path d="M40 150 C80 120, 140 120, 180 150" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Create account</h2>
            <p className="text-sm text-gray-500 mb-6">Create your account to get started</p>

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

            <form className="space-y-4" onSubmit={handleSignup}>
              <InputField label="Employee ID" type="text" placeholder="E.g. EMP123" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} />

              <div className="grid grid-cols-2 gap-4">
                <InputField label="First Name" type="text" placeholder="First" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <InputField label="Last Name" type="text" placeholder="Last" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>

              <InputField label="Designation" type="text" placeholder="Your role/title" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />

              <InputField label="Email" type="email" placeholder="you@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-sm">Password</label>
                  <div className="flex border rounded-lg overflow-hidden items-center">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="flex-1 px-4 py-3 outline-none bg-white dark:bg-slate-700" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 bg-gray-50 dark:bg-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm">Confirm</label>
                  <div className="flex border rounded-lg overflow-hidden items-center">
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="flex-1 px-4 py-3 outline-none bg-white dark:bg-slate-700" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="px-4 bg-gray-50 dark:bg-slate-600">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value, targetRole: e.target.value === "EMPLOYEE" ? formData.targetRole : "" })} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white">
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="HR">HR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                  <option value="MENTOR">MENTOR</option>
                  <option value="SYSTEM_ADMINISTRATOR">SYSTEM ADMINISTRATOR</option>
                </select>
              </div>

              {formData.role === "EMPLOYEE" && (
                <div>
                  <label className="block mb-2 font-medium text-sm">Target Role</label>
                  <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white">
                    <option value="">Select Target Role</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Software Tester">Software Tester</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    <option value="Database Administrator">Database Administrator</option>
                  </select>
                </div>
              )}

              <Button text="Create account" type="submit" />
            </form>

            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-300">Already have an account? <Link to="/login" className="text-indigo-600 font-semibold">Login</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;