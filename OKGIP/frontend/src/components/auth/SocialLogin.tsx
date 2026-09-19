import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  signInWithGoogle,
  signInWithMicrosoft,
} from "@/lib/firebase";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getRoleFromPayload,
  tryDecodeToken,
} from "@/utils/jwt";

export const SocialLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loadingProvider, setLoadingProvider] =
    useState<"google" | "microsoft" | null>(null);

  const [error, setError] = useState("");

  const navigateByRole = (token: string) => {
    const decoded = tryDecodeToken(token);

    if (!decoded) {
      throw new Error(
        "Invalid OKGIP authentication token."
      );
    }

    const actualRole = getRoleFromPayload(decoded);

    if (!actualRole) {
      throw new Error(
        "Your account role could not be verified."
      );
    }

    login(token, true);

    switch (actualRole) {
      case "admin":
        navigate("/admin", { replace: true });
        break;

      case "hr":
        navigate("/hr", { replace: true });
        break;

      case "manager":
        navigate("/manager", { replace: true });
        break;

      case "employee":
        navigate("/employee", { replace: true });
        break;

      case "mentor":
        navigate("/mentor/dashboard", {
          replace: true,
        });
        break;

      default:
        throw new Error(
          `Unsupported user role: ${actualRole}`
        );
    }
  };

  const handleGoogleLogin = async () => {
    if (loadingProvider) return;

    setLoadingProvider("google");
    setError("");

    try {
      const { idToken } =
        await signInWithGoogle();

      const response =
        await authService.googleLogin(idToken);

      if (!response?.token) {
        throw new Error(
          "OKGIP authentication token was not received."
        );
      }

      navigateByRole(response.token);
    } catch (error: any) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Google sign-in was cancelled."
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Google sign-in popup was blocked by the browser."
        );
      } else {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Google sign-in failed."
        );
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (loadingProvider) return;

    setLoadingProvider("microsoft");
    setError("");

    try {
      const { idToken } =
        await signInWithMicrosoft();

      const response =
        await authService.microsoftLogin(idToken);

      if (!response?.token) {
        throw new Error(
          "OKGIP authentication token was not received."
        );
      }

      navigateByRole(response.token);
    } catch (error: any) {
      console.error(
        "MICROSOFT LOGIN ERROR:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Microsoft sign-in was cancelled."
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Microsoft sign-in popup was blocked by the browser."
        );
      } else {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Microsoft sign-in failed."
        );
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">

        {/* GOOGLE */}
        <Button
          type="button"
          variant="outline"
          disabled={loadingProvider !== null}
          onClick={handleGoogleLogin}
          className="h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          <span>
            {loadingProvider === "google"
              ? "Signing in..."
              : "Sign in with Google"}
          </span>
        </Button>

        {/* MICROSOFT */}
        <Button
          type="button"
          variant="outline"
          disabled={loadingProvider !== null}
          onClick={handleMicrosoftLogin}
          className="h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 23 23"
          >
            <path
              fill="#f35325"
              d="M1 1h10v10H1z"
            />
            <path
              fill="#81bc06"
              d="M12 1h10v10H12z"
            />
            <path
              fill="#05a6f0"
              d="M1 12h10v10H1z"
            />
            <path
              fill="#ffba08"
              d="M12 12h10v10H12z"
            />
          </svg>

          <span>
            {loadingProvider === "microsoft"
              ? "Signing in..."
              : "Sign in with Microsoft"}
          </span>
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default SocialLogin;