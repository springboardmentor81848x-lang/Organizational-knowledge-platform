import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading = false,
  disabled = false,
}) => {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full h-12 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          <span>Access Platform</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
      )}
    </Button>
  );
};

export default LoginButton;