
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff
} from "lucide-react";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // SEND OTP
  // ============================================================

  const handleSendOTP = async (e) => {

    e.preventDefault();

    if (!email.trim()) {

      alert("Please enter your email.");

      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        {
          email: email.trim()
        }
      );

      alert(
        response.data.message ||
        "OTP sent successfully."
      );

      setOtpSent(true);

    } catch (error) {

      console.error(
        "Forgot Password Error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to send OTP."
      );

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const handleResetPassword = async (e) => {

    e.preventDefault();

    if (!otp.trim()) {

      alert("Please enter the OTP.");

      return;
    }

    if (!newPassword) {

      alert("Please enter a new password.");

      return;
    }

    if (newPassword.length < 6) {

      alert(
        "Password must contain at least 6 characters."
      );

      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword
        }
      );

      alert(
        response.data.message ||
        "Password reset successfully."
      );

      navigate("/login");

    } catch (error) {

      console.error(
        "Reset Password Error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to reset password."
      );

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* BACK TO LOGIN */}

        <Link
          to="/login"
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">

            <div className="bg-indigo-100 p-4 rounded-full">

              <LockKeyhole
                size={32}
                className="text-indigo-600"
              />

            </div>

          </div>

          <h2 className="text-3xl font-bold">
            Forgot Password?
          </h2>

          <p className="text-gray-500 mt-2">
            Reset your password using an OTP.
          </p>

        </div>

        {/* ================================================== */}
        {/* EMAIL FORM */}
        {/* ================================================== */}

        {!otpSent ? (

          <form
            onSubmit={handleSendOTP}
            className="space-y-5"
          >

            <div>

              <label className="block mb-2 font-medium">
                Email
              </label>

              <div className="flex border rounded-lg overflow-hidden">

                <div className="px-4 flex items-center bg-gray-50">
                  <Mail size={20} />
                </div>

                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="flex-1 px-4 py-3 outline-none"
                />

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>

          </form>

        ) : (

          /* ================================================== */
          /* OTP + NEW PASSWORD FORM */
          /* ================================================== */

          <form
            onSubmit={handleResetPassword}
            className="space-y-5"
          >

            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">

              OTP sent to{" "}

              <strong>
                {email}
              </strong>

            </div>

            {/* OTP */}

            <div>

              <label className="block mb-2 font-medium">
                OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* NEW PASSWORD */}

            <div>

              <label className="block mb-2 font-medium">
                New Password
              </label>

              {/* Password input with visibility button */}

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
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

            {/* RESET */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>

            {/* CHANGE EMAIL */}

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setNewPassword("");
                setShowPassword(false);
              }}
              className="w-full text-indigo-600 hover:underline text-sm"
            >
              Change Email
            </button>

          </form>
        )}

      </div>

    </div>
  );
}

export default ForgotPassword;
