import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
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

      // =====================================================
      // CLEAR OLD TARGET ROLE DATA
      // =====================================================

      localStorage.removeItem("targetRoleId");
      localStorage.removeItem("targetRole");
      localStorage.removeItem("targetAssessmentId");

      // =====================================================
      // SAVE TOKEN
      // =====================================================

      if (response.data.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      // =====================================================
      // SAVE DATABASE USER ID
      // =====================================================
      // IMPORTANT:
      // id = database primary key
      // Example: 43
      //
      // This is different from employeeId:
      // employeeId = MEN001
      //
      // Knowledge Session backend expects the database ID.
      // =====================================================

      if (response.data.id != null) {
        localStorage.setItem(
          "userId",
          response.data.id.toString()
        );

        console.log(
          "Saved Database User ID:",
          response.data.id
        );
      }

      // =====================================================
      // SAVE USER DETAILS
      // =====================================================

      if (response.data.designation) {
        localStorage.setItem(
          "designation",
          response.data.designation
        );
      }

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

      // =====================================================
      // SAVE EMPLOYEE ID
      // =====================================================
      // Example:
      // employeeId = MEN001
      //
      // Keep this separate from userId.
      // =====================================================

      if (response.data.employeeId) {
        localStorage.setItem(
          "employeeId",
          response.data.employeeId
        );
      }

      // =====================================================
      // SAVE TARGET ROLE ID
      // =====================================================

      if (response.data.targetRoleId != null) {
        const targetRoleId = Number(
          response.data.targetRoleId
        );

        localStorage.setItem(
          "targetRoleId",
          targetRoleId.toString()
        );

        console.log(
          "Saved Target Role ID:",
          targetRoleId
        );

        // ===================================================
        // SAVE TARGET ROLE NAME
        // ===================================================

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

        const targetRoleName =
          targetRoles[targetRoleId];

        if (targetRoleName) {
          localStorage.setItem(
            "targetRole",
            targetRoleName
          );

          console.log(
            "Saved Target Role:",
            targetRoleName
          );
        }
      } else {
        console.log(
          "No targetRoleId received from backend."
        );
      }

      // =====================================================
      // GET ROLE FROM RESPONSE
      // =====================================================

      let role = response.data.role;

      // Backend may return:
      // role: { roleName: "Mentor" }

      if (
        role &&
        typeof role === "object"
      ) {
        role = role.roleName;
      }

      // =====================================================
      // GET ROLE FROM JWT IF NEEDED
      // =====================================================

      if (
        !role &&
        response.data.token
      ) {
        try {
          const tokenParts =
            response.data.token.split(".");

          if (tokenParts.length === 3) {
            const payload = JSON.parse(
              atob(tokenParts[1])
            );

            console.log(
              "JWT Payload:",
              payload
            );

            role =
              payload.role ||
              payload.roles ||
              payload.authorities ||
              payload.authority;
          }
        } catch (tokenError) {
          console.warn(
            "Unable to parse role from token:",
            tokenError
          );
        }
      }

      // =====================================================
      // IF ROLE IS ARRAY
      // =====================================================

      if (Array.isArray(role)) {
        role = role[0];
      }

      console.log(
        "Role received from backend:",
        role
      );

      // =====================================================
      // NORMALIZE ROLE
      // =====================================================

      const normalizedRole = role
        ?.toString()
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

      console.log(
        "Normalized Role:",
        normalizedRole
      );

      // =====================================================
      // SAVE SYSTEM ROLE
      // =====================================================

      if (normalizedRole) {
        localStorage.setItem(
          "role",
          normalizedRole
        );
      }

      // =====================================================
      // FINAL DEBUG INFORMATION
      // =====================================================

      console.log(
        "========== LOGIN STORAGE =========="
      );

      console.log(
        "Database User ID:",
        localStorage.getItem("userId")
      );

      console.log(
        "Employee ID:",
        localStorage.getItem("employeeId")
      );

      console.log(
        "System Role:",
        localStorage.getItem("role")
      );

      console.log(
        "Target Role ID:",
        localStorage.getItem("targetRoleId")
      );

      console.log(
        "Target Role:",
        localStorage.getItem("targetRole")
      );

      console.log(
        "===================================="
      );

      // =====================================================
      // ROLE BASED NAVIGATION
      // =====================================================

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
          console.error(
            "Unknown role received:",
            role
          );

          alert(
            `Unknown role: ${
              role || "No role received"
            }`
          );

          break;
      }
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data?.message ||
            "Invalid email or password"
        );
      } else {
        alert(
          "Cannot connect to server"
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT SIDE */}

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

        {/* RIGHT SIDE */}

        <div className="p-10">

          <h2 className="text-3xl font-bold mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            Login to continue
          </p>

          <form
            className="space-y-5"
            onSubmit={handleLogin}
          >

            {/* EMAIL */}

            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            {/* PASSWORD */}

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
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="flex-1 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="px-4 bg-gray-100"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* REMEMBER ME */}

            <div className="flex justify-between items-center text-sm">

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                />

                Remember Me

              </label>

              <a
                href="#"
                className="text-indigo-600 hover:underline"
              >
                Forgot Password?
              </a>

            </div>

            {/* LOGIN */}

            <Button
              text="Login"
              type="submit"
            />

          </form>

          {/* SIGN UP */}

          <p className="text-center mt-6">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="text-indigo-700 font-semibold hover:underline"
            >
              Sign Up
            </Link>

          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;