import React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Cloud,
  Database,
  FileBarChart,
  FileClock,
  FileText,
  Gauge,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Moon,
  Network,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  UserCog,
  Users,
  UserRoundCog,
  X,
  Zap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";


// ============================================================
// DATA
// ============================================================

const kpis = [
  {
    title: "TOTAL USERS",
    value: "2,451",
    change: "+8.6%",
    positive: true,
    icon: Users,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    line: "M12 28 C30 26,35 18,50 21 S72 13,92 9",
  },
  {
    title: "ACTIVE ROLES",
    value: "14",
    change: "+6.3%",
    positive: true,
    icon: UserRoundCog,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    line: "M12 27 C30 25,35 20,50 22 S70 13,92 8",
  },
  {
    title: "SYSTEM UPTIME",
    value: "99.98%",
    change: "+2.1%",
    positive: true,
    icon: ShieldCheck,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    line: "M12 27 C28 25,37 23,49 21 S70 14,92 8",
  },
  {
    title: "API REQUESTS (MTD)",
    value: "1.28M",
    change: "+12.4%",
    positive: true,
    icon: Database,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    line: "M12 27 C28 25,34 17,48 21 S69 10,92 8",
  },
  {
    title: "SECURITY ALERTS",
    value: "7",
    change: "-15.2%",
    positive: false,
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    line: "M12 27 C27 24,38 27,49 20 S70 23,92 8",
  },
  {
    title: "CERTIFICATIONS",
    value: "1,842",
    change: "+9.7%",
    positive: true,
    icon: FileText,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    line: "M12 27 C30 26,35 20,48 22 S70 12,92 7",
  },
];

const roleDistribution = [
  { name: "Employee", count: "1,804", percent: 73.6, width: "73.6%" },
  { name: "Manager", count: "312", percent: 12.7, width: "12.7%" },
  { name: "HR Admin", count: "145", percent: 5.9, width: "5.9%" },
  { name: "L&D Admin", count: "98", percent: 4.0, width: "4%" },
  { name: "System Admin", count: "92", percent: 3.8, width: "3.8%" },
];

const securityAlerts = [
  {
    title: "Failed Login Attempt",
    description: "Multiple failed attempts detected",
    time: "2 mins ago",
    type: "danger",
  },
  {
    title: "Unusual Access Pattern",
    description: "New device login detected",
    time: "15 mins ago",
    type: "warning",
  },
  {
    title: "Permission Change",
    description: "Role permission updated",
    time: "1 hour ago",
    type: "success",
  },
  {
    title: "Data Export Activity",
    description: "Large data export initiated",
    time: "2 hours ago",
    type: "info",
  },
];

const activities = [
  {
    time: "11:32 AM",
    date: "May 12, 2026",
    user: "Daniel Morgan",
    action: "Updated system settings",
    module: "System Settings",
  },
  {
    time: "11:15 AM",
    date: "May 12, 2026",
    user: "Sarah Johnson",
    action: "Created new user account",
    module: "User Management",
  },
  {
    time: "10:48 AM",
    date: "May 12, 2026",
    user: "Mike Thompson",
    action: "Assigned role permissions",
    module: "Role Management",
  },
  {
    time: "10:30 AM",
    date: "May 12, 2026",
    user: "Lisa Wong",
    action: "Generated system report",
    module: "Reports",
  },
  {
    time: "09:45 AM",
    date: "May 12, 2026",
    user: "Daniel Morgan",
    action: "Security policy updated",
    module: "Security",
  },
];


// ============================================================
// SMALL COMPONENTS
// ============================================================

function MiniChart({
  path,
  danger = false,
}: {
  path: string;
  danger?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 35"
      className="h-9 w-20"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d={path}
        stroke={danger ? "#ef4444" : "#7c3aed"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}


function KPI({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconBg,
  iconColor,
  line,
}: (typeof kpis)[number]) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}

          {change}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-semibold tracking-wide text-slate-500">
          {title}
        </p>

        <div className="mt-1 flex items-end justify-between">
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <MiniChart path={line} danger={!positive} />
        </div>
      </div>
    </div>
  );
}


function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}


// ============================================================
// SYSTEM HEALTH
// ============================================================

function SystemHealth() {
  return (
    <SectionCard title="System Health Overview">
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#10b981 0deg 338deg, #f59e0b 338deg 350deg, #ef4444 350deg 353deg, #7c3aed 353deg 360deg)",
            }}
          />

          <div className="absolute inset-[14px] rounded-full bg-white" />

          <div className="relative text-center">
            <p className="text-2xl font-bold text-slate-900">94%</p>
            <p className="text-[10px] text-slate-500">Overall Health</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {[
            ["Services Online", "18", "bg-emerald-500"],
            ["Degraded Services", "1", "bg-amber-500"],
            ["Offline Services", "0", "bg-red-500"],
            ["Maintenance Mode", "1", "bg-purple-500"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-slate-600">{label}</span>
              </div>

              <span className="font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-[10px] text-slate-500">
          Last updated: 2 mins ago
        </span>

        <button className="flex items-center gap-1 text-xs font-semibold text-purple-600">
          View Details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </SectionCard>
  );
}


// ============================================================
// SYSTEM PERFORMANCE
// ============================================================

function SystemPerformance() {
  return (
    <SectionCard
      title="System Performance"
      subtitle="Resource utilization over the last 6 hours"
    >
      <div className="relative h-52">
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <div className="ml-8 h-full">
          <svg
            viewBox="0 0 500 190"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="performanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#8b5cf6"
                  stopOpacity="0.30"
                />
                <stop
                  offset="100%"
                  stopColor="#8b5cf6"
                  stopOpacity="0.03"
                />
              </linearGradient>
            </defs>

            {[25, 60, 95, 130, 165].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="500"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            <path
              d="M0 110 L20 125 L40 115 L60 85 L80 105 L100 92 L120 72 L140 90 L160 108 L180 118 L200 90 L220 110 L240 100 L260 85 L280 125 L300 105 L320 115 L340 80 L360 98 L380 68 L400 75 L420 45 L440 58 L460 40 L480 50 L500 38 L500 190 L0 190 Z"
              fill="url(#performanceGradient)"
            />

            <path
              d="M0 110 L20 125 L40 115 L60 85 L80 105 L100 92 L120 72 L140 90 L160 108 L180 118 L200 90 L220 110 L240 100 L260 85 L280 125 L300 105 L320 115 L340 80 L360 98 L380 68 L400 75 L420 45 L440 58 L460 40 L480 50 L500 38"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[9px] text-slate-400">
          <span>06:00</span>
          <span>07:00</span>
          <span>08:00</span>
          <span>09:00</span>
          <span>10:00</span>
          <span>11:00</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-purple-50 p-3 text-center">
          <p className="text-[10px] text-slate-500">CPU Usage</p>
          <p className="mt-1 text-lg font-bold text-purple-600">42%</p>
        </div>

        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-[10px] text-slate-500">Memory Usage</p>
          <p className="mt-1 text-lg font-bold text-amber-600">68%</p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-center">
          <p className="text-[10px] text-slate-500">Disk Usage</p>
          <p className="mt-1 text-lg font-bold text-emerald-600">55%</p>
        </div>
      </div>
    </SectionCard>
  );
}


// ============================================================
// SECURITY STATUS
// ============================================================

function SecurityStatus() {
  const items = [
    ["Authentication", "Secure", Lock],
    ["Access Control", "Secure", Shield],
    ["Data Encryption", "Secure", KeyRound],
    ["Session Management", "Secure", UserCog],
    ["Password Policy", "Compliant", ShieldCheck],
    ["MFA Enforcement", "Active", Zap],
  ];

  return (
    <SectionCard title="Security Status">
      <div className="space-y-1">
        {items.map(([name, status, Icon]) => {
          const IconComponent = Icon as React.ElementType;

          return (
            <div
              key={name as string}
              className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                  <IconComponent className="h-3.5 w-3.5 text-purple-600" />
                </div>

                <span className="text-xs font-medium text-slate-700">
                  {name as string}
                </span>
              </div>

              <span className="text-[10px] font-semibold text-emerald-600">
                {status as string}
              </span>
            </div>
          );
        })}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-purple-600">
        View Security Center
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </SectionCard>
  );
}


// ============================================================
// USER MANAGEMENT
// ============================================================

function UserManagementSummary() {
  return (
    <SectionCard title="User Management Summary">
      <div className="flex items-center gap-5">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#7c3aed 0deg 265deg, #10b981 265deg 310deg, #f59e0b 310deg 332deg, #3b82f6 332deg 346deg, #9333ea 346deg 360deg)",
            }}
          />

          <div className="absolute inset-[16px] rounded-full bg-white" />

          <div className="relative text-center">
            <p className="text-xl font-bold text-slate-900">2,451</p>
            <p className="text-[9px] text-slate-500">Total Users</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {[
            ["Employees", "1,804", "73.6%", "bg-purple-600"],
            ["Managers", "312", "12.7%", "bg-emerald-500"],
            ["HR Admins", "145", "5.9%", "bg-amber-500"],
            ["L&D Admins", "98", "4.0%", "bg-blue-500"],
            ["System Admins", "92", "3.8%", "bg-purple-400"],
          ].map(([name, count, percent, color]) => (
            <div
              key={name}
              className="flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-slate-600">{name}</span>
              </div>

              <span className="font-semibold text-slate-800">
                {count}{" "}
                <span className="font-normal text-slate-400">
                  ({percent})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button className="flex items-center gap-1 text-xs font-semibold text-purple-600">
          Manage Users
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </SectionCard>
  );
}


// ============================================================
// ROLE DISTRIBUTION
// ============================================================

function RoleDistribution() {
  return (
    <SectionCard title="Role Distribution">
      <div className="space-y-5">
        {roleDistribution.map((role, index) => (
          <div key={role.name}>
            <div className="mb-1.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-600">{role.name}</span>
              <span className="font-semibold text-slate-800">
                {role.count}
              </span>
            </div>

            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  index === 0
                    ? "bg-purple-600"
                    : index === 1
                    ? "bg-emerald-500"
                    : index === 2
                    ? "bg-amber-500"
                    : index === 3
                    ? "bg-blue-500"
                    : "bg-purple-400"
                }`}
                style={{ width: role.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button className="flex items-center gap-1 text-xs font-semibold text-purple-600">
          Manage Roles
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </SectionCard>
  );
}


// ============================================================
// SECURITY ALERTS
// ============================================================

function RecentSecurityAlerts() {
  return (
    <SectionCard
      title="Recent Security Alerts"
      action={
        <button className="text-[10px] font-semibold text-purple-600">
          View All
        </button>
      }
    >
      <div className="space-y-4">
        {securityAlerts.map((alert) => {
          const styles = {
            danger: "bg-red-50 text-red-500",
            warning: "bg-amber-50 text-amber-500",
            success: "bg-emerald-50 text-emerald-500",
            info: "bg-blue-50 text-blue-500",
          };

          const icons = {
            danger: AlertTriangle,
            warning: AlertTriangle,
            success: Users,
            info: FileText,
          };

          const Icon = icons[alert.type as keyof typeof icons];

          return (
            <div key={alert.title} className="flex gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  styles[alert.type as keyof typeof styles]
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold text-slate-800">
                    {alert.title}
                  </p>

                  <span className="shrink-0 text-[9px] text-slate-400">
                    {alert.time}
                  </span>
                </div>

                <p className="mt-1 text-[9px] text-slate-500">
                  {alert.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}


// ============================================================
// TRAINING OVERVIEW
// ============================================================

function TrainingOverview() {
  const stats = [
    {
      label: "Active Training Programs",
      value: "42",
      change: "+14.8%",
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Training Completions (MTD)",
      value: "1,284",
      change: "+18.7%",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Avg. Training Rating",
      value: "4.6 / 5",
      change: "+6.3%",
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Learning Hours (MTD)",
      value: "5,724",
      change: "+22.4%",
      icon: FileClock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <SectionCard title="Training & Learning Overview">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-100 p-3"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>

              <p className="mt-2 text-[9px] text-slate-500">{stat.label}</p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-1 text-[9px] font-semibold text-emerald-600">
                ↑ {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      <button className="mt-5 flex items-center gap-1 text-xs font-semibold text-purple-600">
        View Training Analytics
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </SectionCard>
  );
}


// ============================================================
// SYSTEM ACTIVITY
// ============================================================

function SystemActivity() {
  return (
    <SectionCard title="System Activity (MTD)">
      <div className="space-y-0">
        {[
          ["User Logins", "13,284", "+16.4%"],
          ["Profile Updates", "2,451", "+10.2%"],
          ["Assessments Conducted", "1,842", "+12.1%"],
          ["Training Enrollments", "2,108", "+18.3%"],
          ["Certificates Issued", "842", "+9.7%"],
        ].map(([activity, count, change]) => (
          <div
            key={activity}
            className="grid grid-cols-[1fr_80px_65px] items-center border-b border-slate-100 py-3 last:border-0"
          >
            <span className="text-[10px] text-slate-600">{activity}</span>

            <span className="text-right text-[11px] font-bold text-slate-800">
              {count}
            </span>

            <span className="text-right text-[9px] font-semibold text-emerald-600">
              ↑ {change.replace("+", "")}
            </span>
          </div>
        ))}
      </div>

      <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
        View Activity Logs
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </SectionCard>
  );
}


// ============================================================
// DATABASE BACKUP
// ============================================================

function DatabaseBackup() {
  const items = [
    ["Database Status", "Operational", "text-emerald-600", Database],
    ["Last Backup", "Today, 02:00 AM", "text-emerald-600", RefreshCw],
    ["Backup Status", "Successful", "text-emerald-600", ShieldCheck],
    ["Next Backup", "Tomorrow, 02:00 AM", "text-slate-700", HardDrive],
  ];

  return (
    <SectionCard title="Database & Backup Status">
      <div className="space-y-2">
        {items.map(([name, value, color, Icon]) => {
          const IconComponent = Icon as React.ElementType;

          return (
            <div
              key={name as string}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                  <IconComponent className="h-3.5 w-3.5 text-purple-600" />
                </div>

                <span className="text-[10px] text-slate-600">
                  {name as string}
                </span>
              </div>

              <span
                className={`text-[9px] font-semibold ${
                  color as string
                }`}
              >
                {value as string}
              </span>
            </div>
          );
        })}
      </div>

      <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
        Backup Management
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </SectionCard>
  );
}


// ============================================================
// RECENT ACTIVITIES
// ============================================================

function RecentActivities() {
  return (
    <SectionCard
      title="Recent System Activities"
      action={
        <button className="text-[10px] font-semibold text-purple-600">
          View All
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="pb-3 text-[9px] font-semibold text-slate-400">
                TIME
              </th>
              <th className="pb-3 text-[9px] font-semibold text-slate-400">
                USER
              </th>
              <th className="pb-3 text-[9px] font-semibold text-slate-400">
                ACTION
              </th>
              <th className="pb-3 text-[9px] font-semibold text-slate-400">
                MODULE
              </th>
              <th className="pb-3 text-right text-[9px] font-semibold text-slate-400">
                STATUS
              </th>
            </tr>
          </thead>

          <tbody>
            {activities.map((activity) => (
              <tr
                key={`${activity.time}-${activity.user}`}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="py-3 text-[9px] text-slate-500">
                  <div>{activity.time}</div>
                  <div className="text-[8px] text-slate-400">
                    {activity.date}
                  </div>
                </td>

                <td className="py-3 text-[10px] font-semibold text-slate-700">
                  {activity.user}
                </td>

                <td className="py-3 text-[10px] text-slate-600">
                  {activity.action}
                </td>

                <td className="py-3 text-[9px] font-medium text-slate-500">
                  {activity.module}
                </td>

                <td className="py-3 text-right">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-600">
                    Success
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}


// ============================================================
// QUICK ACTIONS
// ============================================================

function QuickActions() {
  const actions = [
    ["Add New User", Users],
    ["Create New Role", UserRoundCog],
    ["System Settings", Settings],
    ["Backup Now", Database],
    ["Clear Cache", RefreshCw],
    ["View Audit Logs", FileClock],
  ];

  return (
    <SectionCard title="Quick System Actions">
      <div className="grid grid-cols-3 gap-3">
        {actions.map(([label, Icon]) => {
          const IconComponent = Icon as React.ElementType;

          return (
            <button
              key={label as string}
              className="flex min-h-[110px] flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-3 transition hover:border-purple-200 hover:bg-purple-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                <IconComponent className="h-5 w-5 text-purple-600" />
              </div>

              <span className="mt-3 text-center text-[10px] font-semibold text-slate-700">
                {label as string}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}


// ============================================================
// SIDEBAR
// ============================================================

function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const menu = [
    [LayoutDashboard, "Dashboard"],
    [Users, "User Management"],
    [UserRoundCog, "Role Management"],
    [ClipboardList, "Permission Matrix"],
    [Settings, "System Settings"],
    [Shield, "Security Center"],
    [FileClock, "Audit Logs"],
    [Network, "Integrations"],
    [Gauge, "System Health"],
    [Cloud, "Backup & Restore"],
    [FileBarChart, "Reports & Analytics"],
    [Bell, "Notification Settings"],
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[68px] items-center border-b border-slate-100 px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-lg shadow-purple-200">
              <span className="text-lg font-bold text-white">✧</span>
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              OKIP
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {menu.map(([Icon, label], index) => {
              const IconComponent = Icon as React.ElementType;

              return (
                <button
                  key={label as string}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[12px] font-medium transition ${
                    index === 0
                      ? "bg-purple-50 text-purple-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-purple-600"
                  }`}
                >
                  <IconComponent className="h-[17px] w-[17px]" />
                  <span>{label as string}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-100 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <Settings className="h-[17px] w-[17px]" />
            Settings
          </button>

          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <LogOut className="h-[17px] w-[17px]" />
            Logout
          </button>

          <button className="mt-4 flex w-full items-center gap-2 px-4 text-[10px] text-slate-400">
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Collapse Sidebar
          </button>
        </div>
      </aside>
    </>
  );
}


// ============================================================
// HEADER
// ============================================================

function Header({
  setMobileOpen,
}: {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { email, logout } = useAuth();

  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <header className="flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-500 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Overview</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden h-10 w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search className="h-4 w-4 text-slate-400" />

          <input
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            placeholder="Search users, skills, reports..."
          />
        </div>

        {/* Notification */}
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-50">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Theme */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-50"
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
            <CircleUserRound className="h-5 w-5 text-purple-600" />
          </div>

          <div className="hidden sm:block">
            <p className="text-[11px] font-bold text-slate-800">
              Daniel Morgan
            </p>

            <p className="text-[9px] text-slate-500">
              System Administrator
            </p>
          </div>

          <button
            onClick={logout}
            title={`Logout ${email ?? ""}`}
            className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}


// ============================================================
// MAIN ADMIN DASHBOARD
// ============================================================

export const AdminDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="min-w-0 flex-1">
          <Header setMobileOpen={setMobileOpen} />

          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {/* ================================================== */}
            {/* PAGE TITLE */}
            {/* ================================================== */}

            <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-purple-600">
                    Admin Dashboard
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                    System Healthy
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  System Administration Dashboard
                </h1>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Monitor system health, manage users, roles, and security
                  while ensuring optimal platform performance.
                </p>
              </div>

              {/* Top actions */}
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-purple-200 hover:text-purple-600">
                  <Users className="h-4 w-4" />
                  User Management
                </button>

                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-purple-200 hover:text-purple-600">
                  <UserRoundCog className="h-4 w-4" />
                  Role Management
                </button>

                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-purple-200 hover:text-purple-600">
                  <Settings className="h-4 w-4" />
                  System Settings
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-[11px] font-semibold text-white shadow-lg shadow-purple-200 hover:bg-purple-700">
                  <FileBarChart className="h-4 w-4" />
                  Generate System Report
                </button>
              </div>
            </div>

            {/* ================================================== */}
            {/* KPI ROW */}
            {/* ================================================== */}

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {kpis.map((kpi) => (
                <KPI key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* ================================================== */}
            {/* FIRST ROW */}
            {/* ================================================== */}

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SystemHealth />

              <SystemPerformance />

              <SecurityStatus />
            </div>

            {/* ================================================== */}
            {/* SECOND ROW */}
            {/* ================================================== */}

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <UserManagementSummary />

              <RoleDistribution />

              <RecentSecurityAlerts />
            </div>

            {/* ================================================== */}
            {/* THIRD ROW */}
            {/* ================================================== */}

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <TrainingOverview />

              <SystemActivity />

              <DatabaseBackup />
            </div>

            {/* ================================================== */}
            {/* FOURTH ROW */}
            {/* ================================================== */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
              <RecentActivities />

              <QuickActions />
            </div>

            {/* Footer */}
            <div className="py-6 text-center">
              <p className="text-[10px] text-slate-400">
                OKIP • Organizational Knowledge Gap Intelligence Platform
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};


// Default export
export default AdminDashboard;