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
    targetRole: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();

    // =========================================================
    // VALIDATION
    // =========================================================

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

    // Target role required only for Employee
    if (
      formData.role === "EMPLOYEE" &&
      !formData.targetRole
    ) {
      alert("Please select a Target Role.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // =======================================================
      // SIGNUP REQUEST
      // =======================================================

      const signupPayload = {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        email: formData.email,
        password: formData.password,
        role: formData.role,

        targetRole:
          formData.role === "EMPLOYEE"
            ? formData.targetRole
            : null,
      };

      console.log(
        "Signup payload:",
        signupPayload
      );

      const response = await axios.post(
        "http://localhost:8080/api/auth/signup",
        signupPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Signup response:",
        response.data
      );

      alert("Signup Successful!");

      // =======================================================
      // CLEAR OLD TARGET ROLE DATA
      // =======================================================

      localStorage.removeItem("targetRole");
      localStorage.removeItem("targetRoleId");
      localStorage.removeItem("targetAssessmentId");

      // =======================================================
      // SAVE TOKEN
      // =======================================================

      if (response.data.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      // =======================================================
      // SAVE SYSTEM ROLE
      // =======================================================

      if (response.data.role) {
        localStorage.setItem(
          "role",
          response.data.role
        );
      }

      // =======================================================
      // SAVE EMPLOYEE DETAILS
      // =======================================================

      if (response.data.firstName) {
        localStorage.setItem(
          "firstName",
          response.data.firstName
        );
      }

      if (response.data.lastName) {
        localStorage.setItem(
          "lastName",
          response.data.lastName
        );
      }

      if (response.data.employeeId) {
        localStorage.setItem(
          "employeeId",
          response.data.employeeId
        );
      }

      if (response.data.designation) {
        localStorage.setItem(
          "designation",
          response.data.designation
        );
      }

      // =======================================================
      // SAVE TARGET ROLE
      // =======================================================

      if (
        formData.role === "EMPLOYEE" &&
        formData.targetRole
      ) {
        // Save target role name
        localStorage.setItem(
          "targetRole",
          formData.targetRole
        );

        // IMPORTANT:
        // Backend returns the actual targetRoleId.
        // Example:
        // Software Developer -> 1
        // Software Tester    -> 2

        if (response.data.targetRoleId !== null &&
            response.data.targetRoleId !== undefined) {

          localStorage.setItem(
            "targetRoleId",
            response.data.targetRoleId.toString()
          );

          console.log(
            "Target Role:",
            formData.targetRole
          );

          console.log(
            "Target Role ID:",
            response.data.targetRoleId
          );
        }
      }

      // =======================================================
      // RESET FORM
      // =======================================================

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

      // =======================================================
      // NAVIGATE
      // =======================================================

      navigate("/employee");

    } catch (error) {

      console.error(
        "Signup error:",
        error
      );

      const responseData =
        error.response?.data;

      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === "string"
          ? responseData
          : null) ||
        error.message ||
        "Signup failed";

      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* =====================================================
            LEFT SECTION
        ===================================================== */}

        <div className="bg-slate-800 text-white flex flex-col justify-center items-center p-10">

          <h1 className="text-4xl font-bold text-center">
            Organizational Knowledge
          </h1>

          <h2 className="text-3xl font-semibold mt-2 text-center">
            Intelligence Platform
          </h2>

          <p className="mt-6 text-center text-slate-200">
            Empowering organizations through knowledge sharing,
            skill management and intelligent insights.
          </p>

        </div>

        {/* =====================================================
            RIGHT SECTION
        ===================================================== */}

        <div className="p-10">

          <h2 className="text-3xl font-bold mb-2">
            Create Account
          </h2>

          <p className="text-gray-500 mb-8">
            Sign up to get started
          </p>

          <form
            className="space-y-5"
            onSubmit={handleSignup}
          >

            {/* =================================================
                EMPLOYEE ID
            ================================================= */}

            <InputField
              label="Employee ID"
              type="text"
              placeholder="Enter Employee ID"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  employeeId: e.target.value,
                })
              }
            />

            {/* =================================================
                FIRST NAME
            ================================================= */}

            <InputField
              label="First Name"
              type="text"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  firstName: e.target.value,
                })
              }
            />

            {/* =================================================
                LAST NAME
            ================================================= */}

            <InputField
              label="Last Name"
              type="text"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lastName: e.target.value,
                })
              }
            />

            {/* =================================================
                DESIGNATION
            ================================================= */}

            <InputField
              label="Designation"
              type="text"
              placeholder="Enter Designation"
              value={formData.designation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  designation: e.target.value,
                })
              }
            />

            {/* =================================================
                EMAIL
            ================================================= */}

            <InputField
              label="Email"
              type="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label className="block mb-2 font-medium">
                Password
              </label>

              <div className="flex border rounded-lg overflow-hidden">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  className="px-4 bg-gray-100"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>

              </div>

            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div>

              <label className="block mb-2 font-medium">
                Confirm Password
              </label>

              <div className="flex border rounded-lg overflow-hidden">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
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
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >

                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>

              </div>

            </div>

            {/* =================================================
                SYSTEM ROLE
            ================================================= */}

            <div>

              <label className="block mb-2 font-medium">
                Role
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                    targetRole:
                      e.target.value === "EMPLOYEE"
                        ? formData.targetRole
                        : "",
                  })
                }
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >

                <option value="EMPLOYEE">
                  EMPLOYEE
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="MANAGER">
                  MANAGER
                </option>

                <option value="DEPARTMENT_HEAD">
                  DEPARTMENT HEAD
                </option>

                <option value="MENTOR">
                  MENTOR
                </option>

                <option value="SYSTEM_ADMINISTRATOR">
                  SYSTEM ADMINISTRATOR
                </option>

              </select>

            </div>

            {/* =================================================
                TARGET ROLE
            ================================================= */}

            {formData.role === "EMPLOYEE" && (

              <div>

                <label className="block mb-2 font-medium">
                  Target Role
                </label>

                <select
                  value={formData.targetRole}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetRole: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >

                  <option value="">
                    Select Target Role
                  </option>

                  <option value="Software Developer">
                    Software Developer
                  </option>

                  <option value="Software Tester">
                    Software Tester
                  </option>

                  <option value="Data Analyst">
                    Data Analyst
                  </option>

                  <option value="Data Scientist">
                    Data Scientist
                  </option>

                  <option value="DevOps Engineer">
                    DevOps Engineer
                  </option>

                  <option value="UI/UX Designer">
                    UI/UX Designer
                  </option>

                  <option value="Cybersecurity Analyst">
                    Cybersecurity Analyst
                  </option>

                  <option value="Database Administrator">
                    Database Administrator
                  </option>

                </select>

              </div>

            )}

            {/* =================================================
                CREATE ACCOUNT
            ================================================= */}

            <Button
              text="Create Account"
              type="submit"
            />

          </form>

          {/* ===================================================
              LOGIN LINK
          =================================================== */}

          <p className="text-center mt-6">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-indigo-700 font-semibold hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;