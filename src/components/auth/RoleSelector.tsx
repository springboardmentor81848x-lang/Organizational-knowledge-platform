import React from "react";
import { User, Users, BarChart3, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

type RoleType = "ROLE_EMPLOYEE" | "ROLE_HR" | "ROLE_MANAGER" | "ROLE_ADMIN";

interface RoleOption {
  id: RoleType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface RoleSelectorProps {
  value: RoleType;
  onChange: (role: RoleType) => void;
  error?: string;
}

const roles: RoleOption[] = [
  {
    id: "ROLE_EMPLOYEE",
    label: "Employee",
    description: "Access your personal dashboard",
    icon: <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  },
  {
    id: "ROLE_HR",
    label: "HR",
    description: "Manage workforce and talent",
    icon: <Users className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: "ROLE_MANAGER",
    label: "Manager",
    description: "Oversee teams and performance",
    icon: <BarChart3 className="w-5 h-5 text-amber-500" />,
  },
  {
    id: "ROLE_ADMIN",
    label: "Admin",
    description: "System administration",
    icon: <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
        Select Your Role
      </Label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {roles.map((role) => {
          const isSelected = value === role.id;
          return (
            <div
              key={role.id}
              onClick={() => onChange(role.id)}
              className={`relative flex flex-col items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 text-center select-none min-h-[120px] ${
                isSelected
                  ? "bg-purple-50/40 dark:bg-purple-950/20 border-purple-500 ring-1 ring-purple-500"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Radio Indicator */}
              <div className="w-full flex justify-end mb-1">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-purple-600 bg-purple-600"
                      : "border-slate-300 dark:border-slate-700 bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className="mb-2">{role.icon}</div>

              {/* Info */}
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  {role.label}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {role.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium pt-0.5">{error}</p>
      )}
    </div>
  );
};

export default RoleSelector;