import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { Divider } from "@/components/auth/Divider";
import { LoginFields } from "@/components/auth/LoginFields";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { LoginButton } from "@/components/auth/LoginButton";

const loginSchema = z.object({
  officialEmail: z.string().email("Please enter a valid organization email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
  role: z.enum(["ROLE_EMPLOYEE", "ROLE_HR", "ROLE_MANAGER", "ROLE_ADMIN"], {
    required_error: "Please select a role to proceed",
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Backend Login Request Contract (LoginRequestDTO)
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        officialEmail: data.officialEmail,
        password: data.password,
      });

      const { token } = response.data;

      if (token) {
        if (data.rememberMe) {
          localStorage.setItem("okip_jwt_token", token);
          localStorage.setItem("okip_user_role", data.role);
        } else {
          sessionStorage.setItem("okip_jwt_token", token);
          sessionStorage.setItem("okip_user_role", data.role);
        }

        // Navigate based on selected role
        switch (data.role) {
          case "ROLE_ADMIN":
            navigate("/admin/dashboard");
            break;
          case "ROLE_HR":
            navigate("/hr/dashboard");
            break;
          case "ROLE_MANAGER":
            navigate("/manager/dashboard");
            break;
          case "ROLE_EMPLOYEE":
          default:
            navigate("/employee/dashboard");
            break;
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage("Invalid email or password. Please check your credentials.");
        } else if (error.response?.status === 403) {
          setErrorMessage("Account pending HR approval or access forbidden.");
        } else {
          setErrorMessage(
            error.response?.data?.message || "An error occurred during authentication."
          );
        }
      } else {
        setErrorMessage("Unable to connect to authentication server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-indigo-500/5 transition-all">
      <div className="mb-6 space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign in to your enterprise intelligence dashboard.
        </p>
      </div>

      <SocialLogin />

      <Divider text="OR CONTINUE WITH EMAIL" />

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <LoginFields register={register} errors={errors} watch={watch} setValue={setValue} />

        <RoleSelector
          value={selectedRole}
          onChange={(role) => setValue("role", role, { validateStatus: true })}
          error={errors.role?.message}
        />

        <LoginButton isLoading={isLoading} />
      </form>

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