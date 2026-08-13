import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import AuthHero from "@/components/auth/AuthHero";
import { authService } from "@/services/authService";

export const Register: React.FC = () => {
  const navigate = useNavigate();

  // -----------------------------
  // Form state
  // -----------------------------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // -----------------------------
  // UI state
  // -----------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // -----------------------------
  // Messages
  // -----------------------------
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // -----------------------------
  // Register
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your official email.");
      return;
    }

    if (!departmentId) {
      setErrorMessage("Please select your department.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Split full name into firstName and lastName
    const nameParts = fullName.trim().split(/\s+/);

    const firstName = nameParts[0];

    const lastName =
      nameParts.length > 1
        ? nameParts.slice(1).join(" ")
        : "";

    setIsLoading(true);

    try {
      const response = await authService.register({
        firstName,
        lastName,
        email: email.trim(),
        password,
        departmentId: Number(departmentId),
      });

      console.log("REGISTER RESPONSE =", response);

      setSuccessMessage(
        "Registration successful. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error: any) {
      console.error("REGISTRATION ERROR =", error);

      if (error?.response?.status === 409) {
        setErrorMessage(
          error?.response?.data?.message ||
            "This official email is already registered."
        );
      } else if (error?.response?.status === 400) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Invalid registration details."
        );
      } else if (error?.response?.status === 404) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Department not found."
        );
      } else {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`h-screen w-full flex bg-[#0d0922] font-sans antialiased overflow-hidden ${
        isDarkMode ? "dark" : ""
      }`}
    >
      {/* =========================================
          LEFT SIDE - SAME HERO AS LOGIN
          ========================================= */}
      <AuthHero />

      {/* =========================================
          RIGHT SIDE
          ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 xl:p-6 bg-[#f3f4f8] dark:bg-slate-950 h-full overflow-hidden">
        {/* =========================================
            REGISTRATION CARD
            ========================================= */}
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 xl:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative max-h-[96vh] flex flex-col justify-between">

          {/* =======================================
              LIGHT / DARK TOGGLE
              ======================================= */}
          <div className="absolute top-4 right-4 z-50">
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">

              {/* Light mode */}
              <button
                type="button"
                onClick={() => setIsDarkMode(false)}
                aria-label="Light mode"
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                  !isDarkMode
                    ? "bg-white text-amber-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>

              {/* Dark mode */}
              <button
                type="button"
                onClick={() => setIsDarkMode(true)}
                aria-label="Dark mode"
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                  isDarkMode
                    ? "bg-slate-700 text-purple-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* =======================================
              HEADER
              ======================================= */}
          <div className="space-y-1 mb-3 pr-20">
            <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Your Account
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Register for OKIP. Your account will be reviewed by HR before you can sign in.
            </p>
          </div>

          {/* =======================================
              ERROR MESSAGE
              ======================================= */}
          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              {errorMessage}
            </div>
          )}

          {/* =======================================
              SUCCESS MESSAGE
              ======================================= */}
          {successMessage && (
            <div className="mb-3 p-2.5 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50">
              {successMessage}
            </div>
          )}

          {/* =======================================
              FORM
              ======================================= */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >

            {/* =====================================
                FULL NAME
                ===================================== */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </Label>

              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />

                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-9 h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* =====================================
                OFFICIAL EMAIL
                ===================================== */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Official Email
              </Label>

              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />

                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* =====================================
                DEPARTMENT
                ===================================== */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Department
              </Label>

              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 z-10 pointer-events-none" />

                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full h-10 pl-9 pr-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">
                    Select your department
                  </option>

                  <option value="1">
                    IT
                  </option>

                  <option value="2">
                    HR
                  </option>

                  <option value="3">
                    Finance
                  </option>

                  <option value="4">
                    Sales
                  </option>
                </select>
              </div>
            </div>

            {/* =====================================
                PASSWORD + CONFIRM PASSWORD
                ===================================== */}
            <div className="grid grid-cols-2 gap-2.5">

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />

                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-9 h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-purple-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </Label>

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />

                  <Input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    className="pl-9 pr-9 h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-purple-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* =====================================
                PASSWORD INFO
                ===================================== */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Use at least 8 characters. Your password is encrypted before it is stored.
            </p>

            {/* =====================================
                TERMS
                ===================================== */}
            <div className="flex items-center gap-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />

              <label
                htmlFor="terms"
                className="text-[11px] text-slate-500 dark:text-slate-400"
              >
                I agree to the{" "}
                <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* =====================================
                REGISTER BUTTON
                ===================================== */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </span>

              {!isLoading && (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* =======================================
              LOGIN LINK
              ======================================= */}
          <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;