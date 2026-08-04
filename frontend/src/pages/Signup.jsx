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

  console.log("1. Button clicked");
  console.log(formData);

  if (
    !formData.employeeId ||
    !formData.firstName ||
    !formData.lastName ||
    !formData.designation ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    console.log("2. Validation failed");
    alert("Please fill in all fields.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    console.log("3. Password mismatch");
    alert("Passwords do not match");
    return;
  }

  console.log("4. Calling axios...");

  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/signup",
      {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        designation: formData.designation,
        role: formData.role,
      }
    );

    console.log("5. Success", response.data);
    alert("Signup successful! Please login.");
    navigate("/login");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Signup failed";

    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("Headers:", error.response?.headers);
    console.error(error);

    alert(errorMessage);
  }
};


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
        <div className="bg-blue-700 text-white flex flex-col justify-center items-center p-10">
          <h1 className="text-4xl font-bold text-center">Organizational Knowledge</h1>
          <h2 className="text-3xl font-semibold mt-2 text-center">Intelligence Platform</h2>
          <p className="mt-6 text-center text-blue-100">
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
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <div>
              <label className="block mb-2 font-medium">Password</label>
              <div className="flex border rounded-lg overflow-hidden">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 bg-gray-100"
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
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="flex-1 px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-4 bg-gray-100"
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
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option>EMPLOYEE</option>
                <option>HR</option>
                <option>Manager</option>
              </select>
            </div>

            <Button text="Create Account" type="submit" />
          </form>

          <p className="text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
