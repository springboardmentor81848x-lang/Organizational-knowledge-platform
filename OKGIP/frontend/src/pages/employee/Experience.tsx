import React, { useEffect, useState } from "react";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";
import api from "@/api/axios";

interface Experience {
  experienceId: number;
  employeeCode: string;
  companyName: string;
  designation: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  currentlyWorking: boolean;
  yearsOfExperience: number;
  jobDescription: string;
}

interface ExperienceForm {
  companyName: string;
  designation: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  yearsOfExperience: string;
  jobDescription: string;
}

const emptyForm: ExperienceForm = {
  companyName: "",
  designation: "",
  employmentType: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  yearsOfExperience: "",
  jobDescription: "",
};

const ExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ExperienceForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // LOAD EXPERIENCES
  // --------------------------------------------------

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/experience");

      setExperiences(response.data || []);
    } catch (err) {
      console.error("Failed to load experiences:", err);
      setError("Failed to load your experience.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;

      setForm((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // OPEN ADD FORM
  // --------------------------------------------------

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

  const openEditForm = (experience: Experience) => {
    setEditingId(experience.experienceId);

    setForm({
      companyName: experience.companyName || "",
      designation: experience.designation || "",
      employmentType: experience.employmentType || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate || "",
      currentlyWorking: experience.currentlyWorking || false,
      yearsOfExperience:
        experience.yearsOfExperience !== null &&
        experience.yearsOfExperience !== undefined
          ? String(experience.yearsOfExperience)
          : "",
      jobDescription: experience.jobDescription || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // --------------------------------------------------
  // SAVE EXPERIENCE
  // POST /api/experience
  // PUT /api/experience/{id}
  // --------------------------------------------------

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Basic validation
    if (!form.companyName.trim()) {
      setError("Please enter company name.");
      return;
    }

    if (!form.designation.trim()) {
      setError("Please enter designation.");
      return;
    }

    if (!form.employmentType) {
      setError("Please select employment type.");
      return;
    }

    if (!form.startDate) {
      setError("Please select start date.");
      return;
    }

    if (!form.yearsOfExperience) {
      setError("Please enter years of experience.");
      return;
    }

    if (
      !form.currentlyWorking &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        companyName: form.companyName.trim(),
        designation: form.designation.trim(),
        employmentType: form.employmentType,
        startDate: form.startDate,
        endDate: form.currentlyWorking
          ? null
          : form.endDate || null,
        currentlyWorking: form.currentlyWorking,
        yearsOfExperience: Number(form.yearsOfExperience),
        jobDescription: form.jobDescription.trim(),
      };

      if (editingId !== null) {
        // UPDATE
        await api.put(
          `/experience/${editingId}`,
          requestData
        );

        setSuccess("Experience updated successfully.");
      } else {
        // CREATE
        await api.post(
          "/experience",
          requestData
        );

        setSuccess("Experience added successfully.");
      }

      await loadExperiences();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error("Failed to save experience:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save experience.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE EXPERIENCE
  // DELETE /api/experience/{id}
  // --------------------------------------------------

  const handleDelete = async (experienceId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(experienceId);
      setError("");
      setSuccess("");

      await api.delete(
        `/experience/${experienceId}`
      );

      setExperiences((previous) =>
        previous.filter(
          (experience) =>
            experience.experienceId !== experienceId
        )
      );

      setSuccess("Experience deleted successfully.");
    } catch (err: any) {
      console.error(
        "Failed to delete experience:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete experience.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <EmployeePage
      title="Experience"
      subtitle="Manage your professional experience and employment history."
    >
      <Card
        title="Professional Experience"
        subtitle="Your employment and professional experience."
        action={
          !showForm ? (
            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
            >
              + Add Experience
            </button>
          ) : null
        }
      >

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* ADD / EDIT FORM */}
        {/* ================================================= */}

        {showForm && (
          <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50/30 p-5">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingId !== null
                    ? "Edit Experience"
                    : "Add Experience"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {editingId !== null
                    ? "Update your professional experience."
                    : "Add your professional experience."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>

            {/* FORM FIELDS */}

            <div className="grid gap-4 md:grid-cols-2">

              {/* COMPANY NAME */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Company Name *
                </label>

                <input
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Example: TCS"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                />
              </div>

              {/* DESIGNATION */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Designation *
                </label>

                <input
                  name="designation"
                  type="text"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Example: Software Developer"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                />
              </div>

              {/* EMPLOYMENT TYPE */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Employment Type *
                </label>

                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                >
                  <option value="">
                    Select employment type
                  </option>

                  <option value="FULL_TIME">
                    Full Time
                  </option>

                  <option value="PART_TIME">
                    Part Time
                  </option>

                  <option value="INTERNSHIP">
                    Internship
                  </option>

                  <option value="CONTRACT">
                    Contract
                  </option>
                </select>
              </div>

              {/* YEARS */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Years of Experience *
                </label>

                <input
                  name="yearsOfExperience"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="Example: 1.5"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                />
              </div>

              {/* START DATE */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Start Date *
                </label>

                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                />
              </div>

              {/* END DATE */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  End Date
                </label>

                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={form.currentlyWorking}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* CURRENTLY WORKING */}

            <div className="mt-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  name="currentlyWorking"
                  type="checkbox"
                  checked={form.currentlyWorking}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600"
                />

                I currently work here
              </label>
            </div>

            {/* JOB DESCRIPTION */}

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Job Description
              </label>

              <textarea
                name="jobDescription"
                value={form.jobDescription}
                onChange={handleChange}
                placeholder="Describe your responsibilities, technologies used, projects, etc."
                rows={4}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
              />
            </div>

            {/* FORM BUTTONS */}

            <div className="mt-5 flex justify-end gap-2">

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Experience"
                  : "Save Experience"}
              </button>

            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (
          <div className="rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-500">
              Loading experience...
            </p>
          </div>
        ) : experiences.length === 0 && !showForm ? (

          /* ================================================= */
          /* EMPTY STATE */
          /* ================================================= */

          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
              <span className="text-2xl">
                💼
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No experience added yet
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add your professional experience to build your employee profile.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 rounded-lg bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-700"
            >
              + Add Experience
            </button>

          </div>

        ) : (

          /* ================================================= */
          /* EXPERIENCE LIST */
          /* ================================================= */

          <div className="space-y-4">

            {experiences.map((experience) => (

              <div
                key={experience.experienceId}
                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-purple-200 hover:shadow-sm"
              >

                {/* HEADER */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {experience.designation || "Designation"}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-purple-600">
                      {experience.companyName || "Company"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {experience.employmentType
                        ? experience.employmentType
                            .replaceAll("_", " ")
                        : "-"}
                    </p>

                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold ${
                      experience.currentlyWorking
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {experience.currentlyWorking
                      ? "Currently Working"
                      : "Completed"}
                  </span>

                </div>

                {/* DETAILS */}

                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Start Date
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {experience.startDate || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      End Date
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {experience.currentlyWorking
                        ? "Present"
                        : experience.endDate || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Experience
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {experience.yearsOfExperience ?? 0} years
                    </p>
                  </div>

                </div>

                {/* DESCRIPTION */}

                {experience.jobDescription && (
                  <div className="mt-4 border-t border-slate-100 pt-4">

                    <p className="text-[10px] font-medium text-slate-400">
                      Job Description
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {experience.jobDescription}
                    </p>

                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(experience)
                    }
                    className="rounded-lg border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-600 transition hover:bg-purple-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        experience.experienceId
                      )
                    }
                    disabled={
                      deletingId ===
                      experience.experienceId
                    }
                    className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId ===
                    experience.experienceId
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </Card>
    </EmployeePage>
  );
};

export default ExperiencePage;