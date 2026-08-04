import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
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
        }
      );

      console.log("Login Success:", response.data);

      // Save JWT Token
      localStorage.setItem("token", response.data.token);

      // Decode JWT payload
      const payload = JSON.parse(
        atob(response.data.token.split(".")[1])
      );

      const role = payload.role;

      localStorage.setItem("role", role);

      switch (role) {
        case "EMPLOYEE":
          navigate("/employee");
          break;

        case "HR":
          navigate("/hr");
          break;

        case "MANAGER":
          navigate("/manager");
          break;

        case "ADMIN":
          navigate("/admin");
          break;

        default:
          alert("Unknown role");
      }

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message || "Invalid email or password");
      } else {
        alert("Cannot connect to server");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Section */}

        <div className="bg-blue-700 text-white flex flex-col justify-center items-center p-10">

          <h1 className="text-4xl font-bold text-center">
            Organizational Knowledge
          </h1>

          <h2 className="text-3xl font-semibold mt-2 text-center">
            Intelligence Platform
          </h2>

          <p className="mt-6 text-center text-blue-100">
            Empowering organizations through knowledge sharing,
            skill management and intelligent insights.
          </p>

        </div>

        {/* Right Section */}

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

            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>

              <label className="block mb-2 font-medium">
                Password
              </label>

              <div className="flex border rounded-lg overflow-hidden">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            <div className="flex justify-between items-center text-sm">

              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember Me
              </label>

              <a
                href="#"
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </a>

            </div>

            <Button
              text="Login"
              type="submit"
            />

          </form>

          <p className="text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-700 font-semibold hover:underline"
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