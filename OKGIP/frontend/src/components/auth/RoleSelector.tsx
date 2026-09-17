import React from "react";
import { User, Users, BarChart3, Shield, GraduationCap, } from "lucide-react";
import { Label } from "@/components/ui/label";

type RoleType =
  | "ROLE_EMPLOYEE"
  | "ROLE_HR"
  | "ROLE_MANAGER"
  | "ROLE_ADMIN" 
  | "ROLE_MENTOR";

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
    icon: <User className="w-6 h-6 text-purple-600" />,
  },
  {
    id: "ROLE_HR",
    label: "HR",
    description: "Manage workforce and talent",
    icon: <Users className="w-6 h-6 text-emerald-500" />,
  },
  {
    id: "ROLE_MANAGER",
    label: "Manager",
    description: "Oversee teams and performance",
    icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
  },
  {
    id: "ROLE_ADMIN",
    label: "Admin",
    description: "System administration",
    icon: <Shield className="w-6 h-6 text-purple-600" />,
  },

  {
  id: "ROLE_MENTOR",
  label: "Mentor",
  description: "Guide employees and share expertise",
  icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
},
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="role-selector">
      <Label className="role-selector-title">
        Select Your Role
      </Label>

      <div className="role-grid">
        {roles.map((role) => {
          const selected = value === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`role-card ${
                selected ? "role-card-selected" : ""
              }`}
            >
              <span className="role-radio">
                {selected && <span className="role-radio-dot" />}
              </span>

              <span className="role-icon">
                {role.icon}
              </span>

              <span className="role-label">
                {role.label}
              </span>

              <span className="role-description">
                {role.description}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="role-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelector;