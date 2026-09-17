import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import API from "@/api/axios";

import { storeToken } from "@/utils/authStorage";
import { getRoleFromPayload, tryDecodeToken, type AppRole } from "@/utils/jwt";

import { SocialLogin } from "@/components/auth/SocialLogin";
import { Divider } from "@/components/auth/Divider";
import { LoginFields } from "@/components/auth/LoginFields";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { LoginButton } from "@/components/auth/LoginButton";

/* ---------------------------------------------------------
   LOGIN VALIDATION
--------------------------------------------------------- */

const loginSchema = z.object({
  officialEmail: z
    .string()
    .email("Please enter a valid organization email address"),

  password: z
    .string()
    .min(1, "Password is required"),

  rememberMe: z
    .boolean(),

  role: z.enum(
    [
      "ROLE_EMPLOYEE",
      "ROLE_HR",
      "ROLE_MANAGER",
      "ROLE_ADMIN",
      "ROLE_MENTOR",
    ],
    {
      message: "Please select a role to proceed",
    }
  ),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/* ---------------------------------------------------------
   LOGIN COMPONENT
--------------------------------------------------------- */

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     REACT HOOK FORM
  ------------------------------------------------------- */

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      officialEmail: "",
      password: "",
      rememberMe: false,
      role: "ROLE_EMPLOYEE",
    },
  });

  const selectedRole = watch("role");

  /* -------------------------------------------------------
     LOGIN SUBMIT
  ------------------------------------------------------- */

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("LOGIN REQUEST:", {
        officialEmail: data.officialEmail,
      });

      /* ---------------------------------------------------
         CALL BACKEND
         
         Backend endpoint:
         POST http://localhost:8080/api/auth/login

         API baseURL is:
         http://localhost:8080/api

         Therefore:
         "/auth/login"
         
         becomes:
         http://localhost:8080/api/auth/login
      --------------------------------------------------- */

      const response = await API.post("/auth/login", {
        officialEmail: data.officialEmail,
        password: data.password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      /* ---------------------------------------------------
         GET JWT TOKEN
      --------------------------------------------------- */

      const token = response.data?.token;

      if (!token) {
        console.error(
          "Backend login succeeded but token was not received."
        );

        setErrorMessage(
          "Login successful, but authentication token was not received."
        );

        return;
      }

      console.log("JWT TOKEN RECEIVED:", true);

      /* ---------------------------------------------------
         CLEAR OLD AUTH DATA
         
         This prevents old/stale tokens from interfering.
      --------------------------------------------------- */

      localStorage.removeItem("okip_token");
      localStorage.removeItem("okip_role");

      sessionStorage.removeItem("okip_token");
      sessionStorage.removeItem("okip_role");

      /* ---------------------------------------------------
         STORE TOKEN + ROLE
         
         rememberMe = true
         → localStorage

         rememberMe = false
         → sessionStorage
      --------------------------------------------------- */

      // Store JWT using the centralized auth storage
storeToken(token, data.rememberMe);

// Store selected role
if (data.rememberMe) {
  localStorage.setItem("okip_role", data.role);
  sessionStorage.removeItem("okip_role");
} else {
  sessionStorage.setItem("okip_role", data.role);
  localStorage.removeItem("okip_role");
}

        console.log("Authentication stored in sessionStorage.");
      

      /* ---------------------------------------------------
         NAVIGATE BASED ON BACKEND JWT ROLE
      --------------------------------------------------- */
      const decoded = tryDecodeToken(token);
      const actualRole = decoded ? getRoleFromPayload(decoded) : null;
      const selectedRole = data.role.replace(/^ROLE_/, "").toLowerCase() as AppRole;
      if (!actualRole || actualRole !== selectedRole) {
        setErrorMessage(`Access denied. This account is registered as ${actualRole || "unknown"}.`);
        return;
      }
      switch (actualRole) {
        case "admin":
          console.log("Navigating to Admin Dashboard");
          navigate("/admin");
          break;

        case "hr":
          console.log("Navigating to HR Dashboard");
          navigate("/hr");
          break;

        case "manager":
          console.log("Navigating to Manager Dashboard");
          navigate("/manager/dashboard");
          break;

        case "employee":
          console.log("Navigating to Employee Dashboard");
          navigate("/employee");
          break;

        case "mentor":
          console.log("Navigating to Mentor Dashboard");
          navigate("/mentor/dashboard");
          break;

        default:
          console.error("Invalid role:", data.role);

          setErrorMessage(
            "Invalid role selected. Please select a valid role."
          );
          break;
      }
    } catch (error: unknown) {
      console.error("LOGIN FAILED:", error);

      /* ---------------------------------------------------
         AXIOS ERROR
      --------------------------------------------------- */

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        console.error("HTTP STATUS:", status);
        console.error("SERVER RESPONSE:", error.response?.data);

        /* 401 - Invalid credentials */

        if (status === 401) {
          setErrorMessage(
            "Invalid email or password. Please check your credentials."
          );
        }

        /* 403 - Forbidden */

        else if (status === 403) {
          setErrorMessage(
            "Account pending HR approval or access forbidden."
          );
        }

        /* 404 - Endpoint not found */

        else if (status === 404) {
          setErrorMessage(
            "Login API endpoint was not found. Please check the backend server."
          );
        }

        /* 500 - Backend error */

        else if (status === 500) {
          setErrorMessage(
            "Server error occurred during login. Please check the backend."
          );
        }

        /* Network/CORS */

        else if (!error.response) {
          setErrorMessage(
            "Unable to connect to authentication server. Please check that the backend is running."
          );
        }

        /* Other HTTP errors */

        else {
          setErrorMessage(
            error.response?.data?.message ||
              "An error occurred during authentication."
          );
        }
      }

      /* ---------------------------------------------------
         NORMAL JAVASCRIPT ERROR
      --------------------------------------------------- */

      else if (error instanceof Error) {
        setErrorMessage(error.message);
      }

      /* ---------------------------------------------------
         UNKNOWN ERROR
      --------------------------------------------------- */

      else {
        setErrorMessage(
          "Unable to connect to authentication server. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-indigo-500/5 transition-all">

      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}

      <div className="mb-6 space-y-1.5">

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign in to your enterprise intelligence dashboard.
        </p>

      </div>

      {/* ---------------------------------------------------
          SOCIAL LOGIN
      --------------------------------------------------- */}

      <SocialLogin />

      {/* ---------------------------------------------------
          DIVIDER
      --------------------------------------------------- */}

      <Divider text="OR CONTINUE WITH EMAIL" />

      {/* ---------------------------------------------------
          ERROR MESSAGE
      --------------------------------------------------- */}

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          {errorMessage}
        </div>
      )}

      {/* ---------------------------------------------------
          LOGIN FORM
      --------------------------------------------------- */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >

        {/* EMAIL + PASSWORD */}

        <LoginFields
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />

        {/* ROLE */}

        <RoleSelector
          value={selectedRole}
          onChange={(role) =>
            setValue("role", role, {
              shouldValidate: true,
            })
          }
          error={errors.role?.message}
        />

        {/* LOGIN BUTTON */}

        <LoginButton isLoading={isLoading} />

      </form>

      {/* ---------------------------------------------------
          REGISTER / FOOTER
      --------------------------------------------------- */}

      <div className="mt-6 text-center space-y-3">

        <p className="text-xs text-slate-500 dark:text-slate-400">
          New to OKIP?{" "}

          <a
            href="/register"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Request an enterprise demo
          </a>
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">

          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />

          ENTERPRISE-GRADE SSO ENABLED

        </div>

      </div>

    </div>
  );
};

export default LoginForm;