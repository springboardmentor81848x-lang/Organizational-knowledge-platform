import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RememberMe } from "@/components/auth/RememberMe";
import { LoginFormData } from "@/components/auth/LoginForm";

interface LoginFieldsProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  watch: UseFormWatch<LoginFormData>;
  setValue: UseFormSetValue<LoginFormData>;
}

export const LoginFields: React.FC<LoginFieldsProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const rememberMe = watch("rememberMe");

  return (
    <div className="space-y-4">
      {/* Official Email Input Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="officialEmail"
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          Organization Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <Input
            id="officialEmail"
            type="email"
            placeholder="name@company.com"
            {...register("officialEmail")}
            className={`pl-10 h-11 bg-slate-50/50 dark:bg-slate-950/50 border ${
              errors.officialEmail
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            } rounded-xl text-sm transition-all duration-200 focus-visible:ring-2`}
          />
        </div>
        {errors.officialEmail && (
          <p className="text-xs text-red-500 font-medium pt-0.5">
            {errors.officialEmail.message}
          </p>
        )}
      </div>

      {/* Password Input Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
          >
            Password
          </Label>
          <a
            href="/forgot-password"
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className={`pl-10 pr-10 h-11 bg-slate-50/50 dark:bg-slate-950/50 border ${
              errors.password
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            } rounded-xl text-sm transition-all duration-200 focus-visible:ring-2`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 font-medium pt-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me Component */}
      <div className="pt-1">
        <RememberMe
          checked={rememberMe}
          onCheckedChange={(checked) =>
            setValue("rememberMe", checked, { shouldValidate: true })
          }
        />
      </div>
    </div>
  );
};

export default LoginFields;