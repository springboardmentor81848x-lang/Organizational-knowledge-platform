import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  BookOpen,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  X,
  GraduationCap,
  Filter,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import api from "../services/api";

function CourseCatalog() {
  // ==================================================
  // STATE
  // ==================================================

  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "",
    skillId: "",
    level: "",
    duration: "",
    courseUrl: "",
  });

  // ==================================================
  // ROLE
  // ==================================================

  const role =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "MENTOR";

  // ==================================================
  // LOAD COURSES
  // ==================================================

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      setCourses(response.data || []);
    } catch (err) {
      console.error("Error loading courses:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD SKILLS
  // ==================================================

  const loadSkills = async () => {
    try {
      const response = await api.get("/skills");

      setSkills(response.data || []);
    } catch (err) {
      console.error("Error loading skills:", err);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadCourses();
    loadSkills();
  }, []);

  // ==================================================
  // UNIQUE PLATFORMS
  // ==================================================

  const platforms = useMemo(() => {
    const values = courses
      .map((course) => course.platform)
      .filter(Boolean);

    return [...new Set(values)];
  }, [courses]);

  // ==================================================
  // FILTER COURSES
  // ==================================================

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        course.title?.toLowerCase().includes(search) ||
        course.description
          ?.toLowerCase()
          .includes(search) ||
        course.skill?.skillName
          ?.toLowerCase()
          .includes(search);

      const matchesLevel =
        !selectedLevel ||
        course.level === selectedLevel;

      const matchesPlatform =
        !selectedPlatform ||
        course.platform === selectedPlatform;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesPlatform
      );
    });
  }, [
    courses,
    searchTerm,
    selectedLevel,
    selectedPlatform,
  ]);

  // ==================================================
  // OPEN ADD MODAL
  // ==================================================

  const openAddModal = () => {
    setEditingCourse(null);

    setFormData({
      title: "",
      description: "",
      platform: "",
      skillId: "",
      level: "",
      duration: "",
      courseUrl: "",
    });

    setShowModal(true);
  };

  // ==================================================
  // OPEN EDIT MODAL
  // ==================================================

  const openEditModal = (course) => {
    setEditingCourse(course);

    setFormData({
      title: course.title || "",
      description: course.description || "",
      platform: course.platform || "",
      skillId: course.skill?.id || "",
      level: course.level || "",
      duration: course.duration || "",
      courseUrl: course.courseUrl || "",
    });

    setShowModal(true);
  };

  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================================
  // SAVE COURSE
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        title: formData.title,
        description: formData.description,
        platform: formData.platform,
        skill: formData.skillId
          ? {
              id: Number(formData.skillId),
            }
          : null,
        level: formData.level,
        duration: formData.duration,
        courseUrl: formData.courseUrl,
      };

      if (editingCourse) {
        await api.put(
          `/courses/${editingCourse.id}`,
          payload
        );
      } else {
        await api.post("/courses", payload);
      }

      closeModal();
      await loadCourses();
    } catch (err) {
      console.error("Error saving course:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save course."
      );
    }
  };

  // ==================================================
  // DELETE COURSE
  // ==================================================

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/courses/${courseId}`);

      await loadCourses();
    } catch (err) {
      console.error("Error deleting course:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete course."
      );
    }
  };

  // ==================================================
  // OPEN COURSE
  // ==================================================

  const openCourse = (url) => {
    if (!url) {
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==================================================
  // LEVEL BADGE
  // ==================================================

  const getLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";

      case "intermediate":
        return "bg-yellow-100 text-yellow-700";

      case "advanced":
        return "bg-orange-100 text-orange-700";

      case "expert":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar role={role} />

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>
              <div className="flex items-center gap-3">

                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BookOpen
                    size={28}
                    className="text-indigo-600"
                  />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Course Catalog
                  </h1>

                  <p className="text-slate-500 mt-1">
                    Manage learning courses and training resources
                  </p>
                </div>

              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus size={20} />
              Add Course
            </button>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Total Courses
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {courses.length}
                  </p>
                </div>

                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BookOpen
                    size={24}
                    className="text-indigo-600"
                  />
                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Platforms
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {platforms.length}
                  </p>
                </div>

                <div className="p-3 bg-blue-100 rounded-xl">
                  <GraduationCap
                    size={24}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Showing
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {filteredCourses.length}
                  </p>
                </div>

                <div className="p-3 bg-green-100 rounded-xl">
                  <Filter
                    size={24}
                    className="text-green-600"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Search */}

              <div className="relative">

                <Search
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* Level */}

              <select
                value={selectedLevel}
                onChange={(event) =>
                  setSelectedLevel(event.target.value)
                }
                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >

                <option value="">
                  All Levels
                </option>

                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>

                <option value="Expert">
                  Expert
                </option>

              </select>

              {/* Platform */}

              <select
                value={selectedPlatform}
                onChange={(event) =>
                  setSelectedPlatform(event.target.value)
                }
                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >

                <option value="">
                  All Platforms
                </option>

                {platforms.map((platform) => (
                  <option
                    key={platform}
                    value={platform}
                  >
                    {platform}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {/* ==================================================
              COURSE LIST
          ================================================== */}

          {loading ? (

            <div className="flex justify-center items-center py-20">

              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />

            </div>

          ) : filteredCourses.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

              <BookOpen
                size={48}
                className="mx-auto text-slate-300"
              />

              <h2 className="text-xl font-semibold text-slate-700 mt-4">
                No courses found
              </h2>

              <p className="text-slate-500 mt-2">
                Try changing your search or filters.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

              {filteredCourses.map((course) => (

                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                >

                  {/* Course Header */}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div className="p-3 bg-indigo-100 rounded-xl">
                        <BookOpen
                          size={24}
                          className="text-indigo-600"
                        />
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelClass(
                          course.level
                        )}`}
                      >
                        {course.level || "Not specified"}
                      </span>

                    </div>

                    {/* Title */}

                    <h2 className="text-xl font-bold text-slate-900 mt-5 line-clamp-2">
                      {course.title}
                    </h2>

                    {/* Skill */}

                    {course.skill && (
                      <p className="text-sm font-medium text-indigo-600 mt-2">
                        Skill: {course.skill.skillName}
                      </p>
                    )}

                    {/* Description */}

                    <p className="text-sm text-slate-500 mt-3 line-clamp-3">
                      {course.description ||
                        "No description available."}
                    </p>

                    {/* Details */}

                    <div className="mt-5 space-y-2">

                      {course.platform && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <GraduationCap size={17} />
                          <span>
                            {course.platform}
                          </span>
                        </div>
                      )}

                      {course.duration && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock size={17} />
                          <span>
                            {course.duration}
                          </span>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          openEditModal(course)
                        }
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        <Edit size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(course.id)
                        }
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>

                    </div>

                    {course.courseUrl && (
                      <button
                        onClick={() =>
                          openCourse(course.courseUrl)
                        }
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Open
                        <ExternalLink size={15} />
                      </button>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </main>

      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="flex items-center justify-between p-6 border-b border-slate-200">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCourse
                    ? "Edit Course"
                    : "Add Course"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingCourse
                    ? "Update course information"
                    : "Add a new course to the catalog"}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Title */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Example: Advanced Spring Boot"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the course..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Skill + Level */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Skill
                  </label>

                  <select
                    name="skillId"
                    value={formData.skillId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >

                    <option value="">
                      Select Skill
                    </option>

                    {skills.map((skill) => (
                      <option
                        key={skill.id}
                        value={skill.id}
                      >
                        {skill.skillName}
                      </option>
                    ))}

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Level
                  </label>

                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >

                    <option value="">
                      Select Level
                    </option>

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>

                    <option value="Expert">
                      Expert
                    </option>

                  </select>
                </div>

              </div>

              {/* Platform + Duration */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform
                  </label>

                  <input
                    type="text"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    required
                    placeholder="Example: Udemy"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Example: 20 Hours"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              {/* Course URL */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course URL
                </label>

                <input
                  type="url"
                  name="courseUrl"
                  value={formData.courseUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  {editingCourse
                    ? "Update Course"
                    : "Add Course"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default CourseCatalog;