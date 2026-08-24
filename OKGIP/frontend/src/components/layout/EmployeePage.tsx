import React from "react";
import EmployeeLayout from "./EmployeeLayout";

interface EmployeePageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-slate-600">
              {label}
            </span>
          )}

          {showValue && (
            <span className="text-xs font-semibold text-slate-700">
              {value}%
            </span>
          )}
        </div>
      )}

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = "",
  action,
}) => {
  return (
    <section
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-900">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {children}
    </section>
  );
};

const EmployeePage: React.FC<EmployeePageProps> = ({
  title,
  subtitle = "",
  children,
}) => {
  return (
    <EmployeeLayout title={title} subtitle={subtitle}>
      {children}
    </EmployeeLayout>
  );
};

export default EmployeePage;
