import React, { useEffect, useState } from "react";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
  Plus,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  addSkill,
  deleteSkill,
  getMySkills,
  getSkillMaster,
  updateSkill,
  type EmployeeSkill,
  type ProficiencyLevel,
  type SkillMaster,
  type SkillRequest,
} from "@/services/skillService";

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

const EMPTY_FORM: SkillRequest = {
  skillId: 0,
  proficiencyLevel: "BEGINNER",
  yearsOfExperience: 0,
  lastUsed: "",
};

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [skillMaster, setSkillMaster] = useState<SkillMaster[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] =
    useState<EmployeeSkill | null>(null);

  const [form, setForm] = useState<SkillRequest>(EMPTY_FORM);

  // ============================================================
  // LOAD EMPLOYEE SKILLS + SKILL MASTER
  // ============================================================

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [employeeSkills, masterSkills] = await Promise.all([
        getMySkills(),
        getSkillMaster(),
      ]);

      setSkills(employeeSkills);
      setSkillMaster(masterSkills);
    } catch (err: any) {
      console.error("SKILLS LOAD ERROR:", err);

      if (err?.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You are not authorized to view your skills.");
      } else {
        setError(
          "Unable to load skills. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // ADD SKILL
  // ============================================================

  const openAddModal = () => {
    setEditingSkill(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ============================================================
  // EDIT SKILL
  // ============================================================

  const openEditModal = (skill: EmployeeSkill) => {
    setEditingSkill(skill);

    setForm({
      skillId: skill.skillId,
      proficiencyLevel: skill.proficiencyLevel,
      yearsOfExperience: skill.yearsOfExperience ?? 0,
      lastUsed: skill.lastUsed ?? "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSkill(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  // ============================================================
  // SAVE SKILL
  // ============================================================

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.skillId) {
      setError("Please select a skill.");
      return;
    }

    if (form.yearsOfExperience < 0) {
      setError("Years of experience cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      if (editingSkill) {
        await updateSkill(editingSkill.employeeSkillId, form);
        setSuccess("Skill updated successfully.");
      } else {
        await addSkill(form);
        setSuccess("Skill added successfully.");
      }

      await loadData();

      setTimeout(() => {
        setShowModal(false);
        setEditingSkill(null);
        setForm(EMPTY_FORM);
        setSuccess("");
      }, 700);
    } catch (err: any) {
      console.error("SKILL SAVE ERROR:", err);

      if (err?.response?.status === 400) {
        setError(
          err?.response?.data?.message ||
            "Invalid skill details. Please check the values."
        );
      } else if (err?.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You are not authorized to modify skills.");
      } else {
        setError("Unable to save the skill.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE SKILL
  // ============================================================

  const handleDelete = async (skill: EmployeeSkill) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.skillName}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteSkill(skill.employeeSkillId);

      setSkills((current) =>
        current.filter(
          (item) =>
            item.employeeSkillId !== skill.employeeSkillId
        )
      );

      setSuccess("Skill deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      console.error("SKILL DELETE ERROR:", err);

      if (err?.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You are not authorized to delete this skill.");
      } else {
        setError("Unable to delete the skill.");
      }
    }
  };

  // ============================================================
  // CATEGORY FORMATTER
  // ============================================================

  const formatCategory = (category: string) => {
    return category
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="employee-dashboard">

      {/* ======================================================
          EXISTING EMPLOYEE SIDEBAR
          KEEP THIS LAYOUT SAME FOR ALL EMPLOYEE PAGES
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

          <NavLink
            to="/employee/profile"
            className="employee-nav-item"
          >
            <User size={15} />
            <span>My Profile</span>
          </NavLink>

          {/* ACTIVE: SKILL PROFILE */}

          <NavLink
            to="/employee/skills"
            className="employee-nav-item active"
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
          SKILLS PAGE CONTENT
      ====================================================== */}

      <main className="employee-main">

        <div className="space-y-6">

          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Skills
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your technical and professional skills
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />

                Refresh
              </button>

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <Plus size={16} />

                Add Skill
              </button>

            </div>
          </div>

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* SKILLS CARD */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <h2 className="text-lg font-bold text-slate-900">
                Skills
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Skills returned from your employee profile
              </p>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="text-center">

                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-purple-600"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Loading your skills...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Fetching data from the backend
                  </p>

                </div>

              </div>

            ) : skills.length === 0 ? (

              /* EMPTY STATE */

              <div className="flex min-h-[300px] items-center justify-center px-6">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <Plus size={25} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No skills added yet
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Add your first skill to build your skill profile.
                  </p>

                  <button
                    onClick={openAddModal}
                    className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Add Your First Skill
                  </button>

                </div>

              </div>

            ) : (

              /* SKILLS TABLE */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                      <th className="px-6 py-4 text-xs font-bold text-slate-500">
                        Skill
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500">
                        Proficiency
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500">
                        Experience
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500">
                        Last Used
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {skills.map((skill) => (

                      <tr
                        key={skill.employeeSkillId}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >

                        <td className="px-6 py-4">

                          <div>

                            <p className="text-sm font-bold text-slate-900">
                              {skill.skillName}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Skill ID: {skill.skillId}
                            </p>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatCategory(skill.skillCategory)}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                            {skill.proficiencyLevel}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {skill.yearsOfExperience} years
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {skill.lastUsed || "—"}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                openEditModal(skill)
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                              title="Edit skill"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(skill)
                              }
                              className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                              title="Delete skill"
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>

      {/* ======================================================
          ADD / EDIT SKILL MODAL
      ====================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  {editingSkill ? "Edit Skill" : "Add Skill"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select a skill from the Skill Master
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-5 px-6 py-6">

              {/* SKILL */}

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Skill
                </label>

                <select
                  value={form.skillId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      skillId: Number(e.target.value),
                    }))
                  }
                  disabled={!!editingSkill || saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-500 disabled:bg-slate-100"
                >

                  <option value={0}>
                    Select a skill
                  </option>

                  {skillMaster.map((skill) => (

                    <option
                      key={skill.skillId}
                      value={skill.skillId}
                    >
                      {skill.skillName} —{" "}
                      {formatCategory(skill.skillCategory)}
                    </option>

                  ))}

                </select>

                {editingSkill && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Skill name cannot be changed while editing.
                  </p>
                )}

              </div>

              {/* PROFICIENCY */}

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Proficiency Level
                </label>

                <select
                  value={form.proficiencyLevel}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      proficiencyLevel:
                        e.target.value as ProficiencyLevel,
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-500"
                >

                  {PROFICIENCY_LEVELS.map((level) => (

                    <option
                      key={level}
                      value={level}
                    >
                      {level}
                    </option>

                  ))}

                </select>

              </div>

              {/* EXPERIENCE */}

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Years of Experience
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.yearsOfExperience}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      yearsOfExperience:
                        Number(e.target.value),
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-purple-500"
                />

              </div>

              {/* LAST USED */}

              <div>

                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Last Used
                </label>

                <input
                  type="date"
                  value={form.lastUsed || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      lastUsed: e.target.value,
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-purple-500"
                />

              </div>

              {/* FORM ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >

                {saving ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={15} />
                )}

                {saving ? "Saving..." : "Save Skill"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Skills;