import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle,
  Search,
  Plus,
  Edit,
  Eye,
  X,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";

function TrainingManagement() {
  // =====================================================
  // USER ROLE
  // =====================================================

  const role = (
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "MENTOR"
  )
    .toUpperCase()
    .replace("ROLE_", "")
    .trim();

  // =====================================================
  // SAMPLE TRAININGS
  // Replace this later with backend API data
  // =====================================================

  const [trainings, setTrainings] = useState([
    {
      id: 1,
      title: "Advanced Spring Boot Development",
      description:
        "Learn advanced Spring Boot concepts, REST APIs, security, JPA, and microservices.",
      skill: "Spring Boot",
      category: "Backend Development",
      level: "Advanced",
      duration: "6 Weeks",
      enrolled: 18,
      capacity: 25,
      completion: 72,
      status: "ACTIVE",
    },
    {
      id: 2,
      title: "Java Programming Fundamentals",
      description:
        "Build strong Java programming fundamentals including OOP, collections, exceptions, and streams.",
      skill: "Java",
      category: "Programming",
      level: "Beginner",
      duration: "4 Weeks",
      enrolled: 32,
      capacity: 40,
      completion: 84,
      status: "ACTIVE",
    },
    {
      id: 3,
      title: "SQL and Database Management",
      description:
        "Improve SQL querying, database design, joins, indexing, and transaction management skills.",
      skill: "SQL",
      category: "Database",
      level: "Intermediate",
      duration: "5 Weeks",
      enrolled: 21,
      capacity: 30,
      completion: 61,
      status: "ACTIVE",
    },
    {
      id: 4,
      title: "React Frontend Development",
      description:
        "Learn React components, hooks, routing, state management, and modern frontend development.",
      skill: "React",
      category: "Frontend Development",
      level: "Intermediate",
      duration: "6 Weeks",
      enrolled: 15,
      capacity: 25,
      completion: 48,
      status: "INACTIVE",
    },
  ]);

  // =====================================================
  // STATES
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skill: "",
    category: "",
    level: "Beginner",
    duration: "",
    capacity: 20,
    status: "ACTIVE",
  });

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =====================================================
  // CREATE TRAINING
  // =====================================================

  const handleCreateTraining = (e) => {
    e.preventDefault();

    const newTraining = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      skill: formData.skill,
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      enrolled: 0,
      capacity: Number(formData.capacity),
      completion: 0,
      status: formData.status,
    };

    setTrainings([...trainings, newTraining]);

    setShowForm(false);

    setFormData({
      title: "",
      description: "",
      skill: "",
      category: "",
      level: "Beginner",
      duration: "",
      capacity: 20,
      status: "ACTIVE",
    });
  };

  // =====================================================
  // EDIT TRAINING
  // =====================================================

  const handleEdit = (training) => {
    setEditingTraining(training);

    setFormData({
      title: training.title,
      description: training.description,
      skill: training.skill,
      category: training.category,
      level: training.level,
      duration: training.duration,
      capacity: training.capacity,
      status: training.status,
    });

    setShowForm(true);
  };

  // =====================================================
  // UPDATE TRAINING
  // =====================================================

  const handleUpdateTraining = (e) => {
    e.preventDefault();

    setTrainings(
      trainings.map((training) =>
        training.id === editingTraining.id
          ? {
              ...training,
              title: formData.title,
              description: formData.description,
              skill: formData.skill,
              category: formData.category,
              level: formData.level,
              duration: formData.duration,
              capacity: Number(formData.capacity),
              status: formData.status,
            }
          : training
      )
    );

    setEditingTraining(null);
    setShowForm(false);
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const toggleStatus = (id) => {
    setTrainings(
      trainings.map((training) =>
        training.id === id
          ? {
              ...training,
              status:
                training.status === "ACTIVE"
                  ? "INACTIVE"
                  : "ACTIVE",
            }
          : training
      )
    );
  };

  // =====================================================
  // FILTER TRAININGS
  // =====================================================

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      training.skill
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      training.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      training.status === statusFilter;

    const matchesLevel =
      levelFilter === "ALL" ||
      training.level === levelFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesLevel
    );
  });

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalTrainings = trainings.length;

  const activeTrainings = trainings.filter(
    (training) => training.status === "ACTIVE"
  ).length;

  const totalEnrolled = trainings.reduce(
    (sum, training) => sum + training.enrolled,
    0
  );

  const completedTrainings = trainings.filter(
    (training) => training.completion >= 80
  ).length;

  // =====================================================
  // FORM RESET
  // =====================================================

  const openCreateForm = () => {
    setEditingTraining(null);

    setFormData({
      title: "",
      description: "",
      skill: "",
      category: "",
      level: "Beginner",
      duration: "",
      capacity: 20,
      status: "ACTIVE",
    });

    setShowForm(true);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role={role} />

      <div className="flex-1">

        <Navbar title="Training Management" />

        <div className="p-8">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="flex justify-between items-center mb-8">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Training Management
              </h1>

              <p className="text-gray-500 mt-2">
                Create, manage, and monitor employee training
                programs based on identified skill gaps.
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={20} />
              Create Training
            </button>

          </div>

          {/* =====================================================
              STATISTICS
          ===================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Total Trainings */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-gray-500 text-sm">
                    Total Trainings
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {totalTrainings}
                  </h2>
                </div>

                <div className="p-3 bg-indigo-100 rounded-lg">
                  <GraduationCap
                    size={26}
                    className="text-indigo-600"
                  />
                </div>

              </div>

            </div>

            {/* Active */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-gray-500 text-sm">
                    Active Trainings
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {activeTrainings}
                  </h2>
                </div>

                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle
                    size={26}
                    className="text-green-600"
                  />
                </div>

              </div>

            </div>

            {/* Enrolled */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-gray-500 text-sm">
                    Employees Enrolled
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {totalEnrolled}
                  </h2>
                </div>

                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users
                    size={26}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            {/* Completed */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-gray-500 text-sm">
                    High Completion
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {completedTrainings}
                  </h2>
                </div>

                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3
                    size={26}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              SEARCH + FILTER
          ===================================================== */}

          <div className="bg-white rounded-xl shadow p-5 mb-6">

            <div className="grid md:grid-cols-3 gap-4">

              {/* Search */}

              <div className="relative">

                <Search
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search training, skill or category..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="w-full border rounded-lg pl-10 pr-3 py-2.5"
                />

              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="border rounded-lg px-3 py-2.5"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

              {/* Level */}

              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value)
                }
                className="border rounded-lg px-3 py-2.5"
              >
                <option value="ALL">
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
              </select>

            </div>

          </div>

          {/* =====================================================
              TRAINING LIST
          ===================================================== */}

          <div className="grid lg:grid-cols-2 gap-6">

            {filteredTrainings.length === 0 ? (

              <div className="lg:col-span-2 bg-white rounded-xl shadow p-10 text-center">

                <BookOpen
                  size={45}
                  className="mx-auto text-gray-400 mb-4"
                />

                <h3 className="text-lg font-semibold text-gray-700">
                  No trainings found
                </h3>

                <p className="text-gray-500 mt-2">
                  Try changing your search or filters.
                </p>

              </div>

            ) : (

              filteredTrainings.map((training) => (

                <div
                  key={training.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-6"
                >

                  {/* Training Header */}

                  <div className="flex justify-between items-start">

                    <div>

                      <h3 className="text-xl font-bold text-gray-800">
                        {training.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {training.category}
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        training.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {training.status}
                    </span>

                  </div>

                  {/* Description */}

                  <p className="text-gray-600 text-sm mt-4">
                    {training.description}
                  </p>

                  {/* Skill */}

                  <div className="mt-5">

                    <div className="flex items-center gap-2 text-sm">

                      <Target
                        size={17}
                        className="text-indigo-600"
                      />

                      <span className="font-medium">
                        Target Skill:
                      </span>

                      <span className="text-gray-600">
                        {training.skill}
                      </span>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-3 gap-3 mt-5">

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Level
                      </p>

                      <p className="font-semibold text-sm mt-1">
                        {training.level}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Duration
                      </p>

                      <p className="font-semibold text-sm mt-1 flex items-center gap-1">
                        <Clock size={14} />
                        {training.duration}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Enrollment
                      </p>

                      <p className="font-semibold text-sm mt-1">
                        {training.enrolled}/
                        {training.capacity}
                      </p>

                    </div>

                  </div>

                  {/* Progress */}

                  <div className="mt-5">

                    <div className="flex justify-between text-sm mb-2">

                      <span className="text-gray-500">
                        Completion Rate
                      </span>

                      <span className="font-semibold">
                        {training.completion}%
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">

                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${training.completion}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="flex flex-wrap gap-3 mt-6">

                    <button
                      onClick={() =>
                        setSelectedTraining(training)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Eye size={17} />
                      View
                    </button>

                    <button
                      onClick={() =>
                        handleEdit(training)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      <Edit size={17} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        toggleStatus(training.id)
                      }
                      className={`px-4 py-2 rounded-lg text-white ${
                        training.status === "ACTIVE"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {training.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center p-6 border-b">

              <h2 className="text-xl font-bold">
                {editingTraining
                  ? "Edit Training"
                  : "Create Training"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={
                editingTraining
                  ? handleUpdateTraining
                  : handleCreateTraining
              }
              className="p-6"
            >

              <div className="grid md:grid-cols-2 gap-5">

                {/* Title */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium mb-1">
                    Training Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Example: Advanced Spring Boot Development"
                    className="w-full border rounded-lg px-3 py-2.5"
                  />

                </div>

                {/* Skill */}

                <div>

                  <label className="block text-sm font-medium mb-1">
                    Target Skill
                  </label>

                  <input
                    type="text"
                    name="skill"
                    value={formData.skill}
                    onChange={handleChange}
                    required
                    placeholder="Example: Spring Boot"
                    className="w-full border rounded-lg px-3 py-2.5"
                  />

                </div>

                {/* Category */}

                <div>

                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="Example: Backend Development"
                    className="w-full border rounded-lg px-3 py-2.5"
                  />

                </div>

                {/* Level */}

                <div>

                  <label className="block text-sm font-medium mb-1">
                    Difficulty Level
                  </label>

                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2.5"
                  >

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>

                  </select>

                </div>

                {/* Duration */}

                <div>

                  <label className="block text-sm font-medium mb-1">
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    placeholder="Example: 6 Weeks"
                    className="w-full border rounded-lg px-3 py-2.5"
                  />

                </div>

                {/* Capacity */}

                <div>

                  <label className="block text-sm font-medium mb-1">
                    Maximum Employees
                  </label>

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full border rounded-lg px-3 py-2.5"
                  />

                </div>

                {/* Status */}

                <div>

                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2.5"
                  >

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>

                  </select>

                </div>

                {/* Description */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium mb-1">
                    Training Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                    placeholder="Describe what employees will learn from this training..."
                    className="w-full border rounded-lg px-3 py-2.5"
                  />

                </div>

              </div>

              {/* Buttons */}

              <div className="flex gap-3 mt-6">

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingTraining
                    ? "Update Training"
                    : "Create Training"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW TRAINING MODAL
      ===================================================== */}

      {selectedTraining && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedTraining.title}
                </h2>

                <p className="text-gray-500 mt-1">
                  {selectedTraining.category}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedTraining(null)
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>

            </div>

            <div className="mt-6">

              <p className="text-gray-600">
                {selectedTraining.description}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">

                <div className="border rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Target Skill
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedTraining.skill}
                  </p>

                </div>

                <div className="border rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Difficulty
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedTraining.level}
                  </p>

                </div>

                <div className="border rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Duration
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedTraining.duration}
                  </p>

                </div>

                <div className="border rounded-lg p-4">

                  <p className="text-sm text-gray-500">
                    Enrollment
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedTraining.enrolled} /{" "}
                    {selectedTraining.capacity}
                  </p>

                </div>

              </div>

              <div className="mt-6">

                <div className="flex justify-between mb-2">

                  <span className="font-medium">
                    Learning Completion
                  </span>

                  <span className="font-semibold">
                    {selectedTraining.completion}%
                  </span>

                </div>

                <div className="bg-gray-200 rounded-full h-3">

                  <div
                    className="bg-indigo-600 h-3 rounded-full"
                    style={{
                      width: `${selectedTraining.completion}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <button
              onClick={() =>
                setSelectedTraining(null)
              }
              className="mt-6 px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default TrainingManagement;