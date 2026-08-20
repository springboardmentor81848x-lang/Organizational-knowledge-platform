import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RememberMeProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const RememberMe: React.FC<RememberMeProps> = ({
  checked,
  onCheckedChange,
}) => {
  return (
    <div className="flex items-center space-x-2 select-none">
      <Checkbox
        id="rememberMe"
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(Boolean(val))}
        className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:border-indigo-500 transition-colors"
      />
      <Label
        htmlFor="rememberMe"
        className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
      >
        Keep me logged in for 30 days
      </Label>
    </div>
  );
};

export default RememberMe;