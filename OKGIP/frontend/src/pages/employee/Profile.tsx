import React, { useEffect, useState } from "react";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pencil,
  Save,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import profileService, {
  EmployeeProfile,
} from "@/services/profileService";

type Form = Partial<EmployeeProfile>;

const Profile: React.FC = () => {
  const [profile, setProfile] =
    useState<EmployeeProfile | null>(null);

  const [form, setForm] = useState<Form>({});

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await profileService.getMyProfile();

      setProfile(data);
      setForm(data);
    } catch (err: any) {
      console.error("PROFILE LOAD ERROR:", err);

      if (err?.response?.status === 404) {
        setProfile(null);
        setForm({});
      } else if (err?.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to connect to the profile API."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = profile
        ? await profileService.updateMyProfile(form)
        : await profileService.createProfile(form as any);

      setProfile(data);
      setForm(data);

      setEditing(false);

      setMessage("Profile saved successfully.");
    } catch (err: any) {
      console.error("PROFILE SAVE ERROR:", err);

      if (err?.response?.status === 400) {
        setError(
          err?.response?.data?.message ||
            "Invalid profile information."
        );
      } else if (err?.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Profile could not be saved. Check the backend API."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // FIELD COMPONENT
  // ============================================================

  const field = (
    label: string,
    key: keyof EmployeeProfile,
    type = "text"
  ) => (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          value={String(form[key] ?? "")}
          onChange={(e) =>
            setForm((previous) => ({
              ...previous,
              [key]: e.target.value,
            }))
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        />
      ) : (
        <div className="min-h-10 rounded-lg bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700">
          {String(profile?.[key] ?? "Not provided")}
        </div>
      )}
    </div>
  );

  // ============================================================
  // EMPLOYEE INITIALS
  // ============================================================

  const initials = (profile?.employeeName || "Employee")
    .trim()
    .split(/\s+/)
    .map((value) => value[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="employee-dashboard">

      {/* ======================================================
          SAME EMPLOYEE SIDEBAR
      ====================================================== */}

      <aside className="employee-sidebar">

        {/* BRAND */}

        <div className="employee-brand">
          <div className="employee-brand-icon">
            <Zap size={19} />
          </div>

          <span>OKGIP</span>
        </div>

        {/* NAVIGATION */}

        <nav className="employee-nav">

          <NavLink
            to="/employee"
            className="employee-nav-item"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </NavLink>

          {/* ACTIVE PROFILE */}

          <NavLink
            to="/employee/profile"
            className="employee-nav-item active"
          >
            <User size={15} />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/employee/skills"
            className="employee-nav-item"
          >
            <Activity size={15} />
            <span>Skill Profile</span>
          </NavLink>

          <NavLink
            to="/employee/self-assessment"
            className="employee-nav-item"
          >
            <FileCheck2 size={15} />
            <span>Self Assessment</span>
          </NavLink>

          <NavLink
            to="/employee/peer-assessment"
            className="employee-nav-item"
          >
            <Users size={15} />
            <span>Peer Assessment</span>
          </NavLink>

          <NavLink
            to="/employee/proficiency"
            className="employee-nav-item"
          >
            <Target size={15} />
            <span>My Proficiency</span>
          </NavLink>

          <NavLink
            to="/employee/skill-gaps"
            className="employee-nav-item"
          >
            <TrendingUp size={15} />
            <span>Skill Gaps</span>
          </NavLink>

          <NavLink
            to="/employee/learning-paths"
            className="employee-nav-item"
          >
            <BookOpen size={15} />
            <span>Learning Paths</span>
          </NavLink>

          <NavLink
            to="/employee/training"
            className="employee-nav-item"
          >
            <GraduationCap size={15} />
            <span>Training</span>
          </NavLink>
           
           {/* EXPERIENCE */}
<NavLink
  to="/employee/experience"
  className="employee-nav-item"
>
  <Briefcase size={15} />
  <span>Experience</span>
</NavLink>

        
          <NavLink
            to="/employee/progress"
            className="employee-nav-item"
          >
            <Activity size={15} />
            <span>My Progress</span>
          </NavLink>

          <NavLink
            to="/employee/achievements"
            className="employee-nav-item"
          >
            <Award size={15} />
            <span>Achievements</span>
          </NavLink>

          <NavLink
            to="/employee/certifications"
            className="employee-nav-item"
          >
            <ShieldCheck size={15} />
            <span>Certifications</span>
          </NavLink>

          <NavLink
            to="/employee/mentorship"
            className="employee-nav-item"
          >
            <Users size={15} />
            <span>Mentorship</span>
          </NavLink>

          <NavLink
            to="/employee/notifications"
            className="employee-nav-item"
          >
            <Bell size={15} />
            <span>Notifications</span>
          </NavLink>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="employee-sidebar-bottom">

          <NavLink
            to="/employee/settings"
            className="employee-nav-item"
          >
            <Settings size={15} />
            <span>Settings</span>
          </NavLink>

          <div className="employee-nav-item">
            <LogOut size={15} />
            <span>Logout</span>
          </div>

          <div className="employee-collapse">
            <ChevronRight size={14} />
            <span>Collapse Sidebar</span>
          </div>

        </div>

      </aside>

      {/* ======================================================
          PROFILE CONTENT
      ====================================================== */}

      <main className="employee-main">

        <div className="space-y-6">

          {/* HEADER */}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your personal and professional information.
            </p>
          </div>

          {/* SUCCESS */}

          {message && (
            <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-xs font-semibold text-purple-700">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">

                <Loader2
                  className="animate-spin text-purple-600"
                  size={20}
                />

                Loading profile from backend...

              </div>

            </div>

          ) : (

            <>

              {/* ==================================================
                  PROFILE + PERSONAL INFORMATION
              ================================================== */}

              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">

                {/* PROFILE OVERVIEW */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="mb-4">

                    <h2 className="text-base font-bold text-slate-900">
                      Profile Overview
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Live employee data
                    </p>

                  </div>

                  <div className="rounded-xl bg-purple-50 p-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
                        {initials}
                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900">
                          {profile?.employeeName ||
                            "Employee"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {profile?.employeeCode ||
                            "Employee Code not available"}
                        </p>

                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 size={12} />
                          Active
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* PERSONAL INFORMATION */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="mb-5 flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-base font-bold text-slate-900">
                        Personal Information
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Stored through /api/profile
                      </p>

                    </div>

                    {!editing && (
                      <button
                        onClick={() => {
                          setEditing(true);
                          setMessage("");
                          setError("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                      >
                        <Pencil size={14} />
                        Edit Profile
                      </button>
                    )}

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {field(
                      "Phone Number",
                      "phoneNumber"
                    )}

                    {field(
                      "Address",
                      "address"
                    )}

                    {field(
                      "City",
                      "city"
                    )}

                    {field(
                      "State",
                      "state"
                    )}

                    {field(
                      "Country",
                      "country"
                    )}

                    {field(
                      "Pincode",
                      "pincode"
                    )}

                    {field(
                      "Date of Birth",
                      "dateOfBirth",
                      "date"
                    )}

                    {field(
                      "Gender",
                      "gender"
                    )}

                  </div>

                  {/* EDIT BUTTONS */}

                  {editing && (

                    <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">

                      <button
                        onClick={() => {
                          setEditing(false);
                          setForm(profile || {});
                          setError("");
                        }}
                        disabled={saving}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <X
                          size={14}
                          className="mr-1 inline"
                        />
                        Cancel
                      </button>

                      <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                      >

                        {saving ? (
                          <Loader2
                            size={14}
                            className="mr-1 inline animate-spin"
                          />
                        ) : (
                          <Save
                            size={14}
                            className="mr-1 inline"
                          />
                        )}

                        {saving
                          ? "Saving..."
                          : "Save"}

                      </button>

                    </div>

                  )}

                </div>

              </div>

              {/* ==================================================
                  BACKEND CONNECTION
              ================================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5">

                  <h2 className="text-base font-bold text-slate-900">
                    Backend Connection
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    This page uses the existing authenticated API service.
                  </p>

                </div>

                <div className="grid gap-3 md:grid-cols-3">

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      GET /api/profile
                    </p>

                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      Connected / tested
                    </p>

                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      PUT /api/profile
                    </p>

                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      Ready
                    </p>

                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      POST /api/profile
                    </p>

                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      Ready
                    </p>

                  </div>

                </div>

              </div>

            </>

          )}

        </div>

      </main>

    </div>
  );
};

export default Profile;