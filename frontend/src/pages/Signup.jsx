import axios from "axios";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      console.log("Signup payload", {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const response = await axios.post(
        "http://localhost:8080/api/auth/signup",
        {
          employeeId: formData.employeeId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          designation: formData.designation,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Signup Successful!");
      console.log("Signup response", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data.role) {
        localStorage.setItem("role", response.data.role);
      }
      localStorage.setItem("firstName", formData.firstName);
      localStorage.setItem("lastName", formData.lastName);
      localStorage.setItem("employeeId", formData.employeeId);

      setFormData({
        employeeId: "",
        firstName: "",
        lastName: "",
        designation: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "EMPLOYEE",
      });

      navigate("/employee");
    } catch (error) {
      console.error("Signup error:", error);

      const responseData = error.response?.data;
      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === "string" ? responseData : null) ||
        error.message ||
        "Signup failed";

      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
        <div className="bg-slate-800 text-white flex flex-col justify-center items-center p-10">
          <h1 className="text-4xl font-bold text-center">Organizational Knowledge</h1>
          <h2 className="text-3xl font-semibold mt-2 text-center">Intelligence Platform</h2>
          <p className="mt-6 text-center text-slate-200">
            Empowering organizations through knowledge sharing,
            skill management and intelligent insights.
          </p>
        </div>
        <div className="p-10">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Sign up to get started</p>
          <form className="space-y-5" onSubmit={handleSignup}>
            <InputField
              label="Employee ID"
              type="text"
              placeholder="Enter Employee ID"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
            />
            <InputField
              label="First Name"
              type="text"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <InputField
              label="Last Name"
              type="text"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
            <InputField
              label="Designation"
              type="text"
              placeholder="Enter Designation"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
            />
            <InputField
              label="Email"
              type="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <div>
              <label className="block mb-2 font-medium">Password</label>
              <div className="flex border rounded-lg overflow-hidden">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="flex-1 px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  className="px-4 bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Confirm Password</label>
              <div className="flex border rounded-lg overflow-hidden">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  className="px-4 bg-gray-100"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="HR">HR</option>
                <option value="MANAGER">MANAGER</option>
                <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                <option value="MENTOR">MENTOR</option>
                <option value="SYSTEM_ADMINISTRATOR">SYSTEM ADMINISTRATOR</option>
              </select>
            </div>
            <Button text="Create Account" type="submit" />
          </form>
          <p className="text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-700 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
