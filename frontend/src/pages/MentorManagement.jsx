import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  User,
  Mail,
  BookOpen,
  Award,
  Briefcase,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  CalendarDays,
  Edit3,
} from "lucide-react";

import {
  getMentorProfile,
  getMentorExpertise,
} from "../services/MentorManagementService";

function MentorManagement() {
  // =========================================================
  // MENTOR INFORMATION
  // =========================================================

  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const employeeId = localStorage.getItem("employeeId") || "";

  // =========================================================
  // STATE
  // =========================================================

  const [profile, setProfile] = useState(null);
  const [expertise, setExpertise] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Availability
  const [availability, setAvailability] = useState({
    status: "AVAILABLE",
    hours: "9:00 AM - 6:00 PM",
    days: "Monday - Friday",
  });

  // =========================================================
  // LOAD PROFILE + EXPERTISE
  // =========================================================

  useEffect(() => {
    loadMentorManagement();
  }, []);

  const loadMentorManagement = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        setError(
          "Mentor employee ID not found. Please login again."
        );
        return;
      }

      const [profileData, expertiseData] = await Promise.all([
        getMentorProfile(employeeId),
        getMentorExpertise(employeeId),
      ]);

      setProfile(profileData);

      setExpertise(
        Array.isArray(expertiseData)
          ? expertiseData
          : []
      );
    } catch (err) {
      console.error(
        "Mentor Management loading error:",
        err
      );

      setError(
        err.response?.data ||
          "Unable to load mentor management data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE AVAILABILITY
  // =========================================================

  const handleAvailabilityChange = (status) => {
    setAvailability((prev) => ({
      ...prev,
      status,
    }));
  };

  // =========================================================
  // CALCULATE STATISTICS
  // =========================================================

  /*
   * These values are frontend display statistics.
   *
   * If you already have backend APIs for mentorship statistics,
   * we can connect them later.
   */

  const totalExpertise = expertise.length;

  const statistics = {
    totalExpertise,
    mentoringCapacity: 5,
    availability:
      availability.status === "AVAILABLE"
        ? "Available"
        : "Unavailable",
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="MENTOR" />

        <div className="flex-1">
          <Navbar title="Mentor Management" />

          <main className="p-8">
            <div className="rounded-xl bg-white p-8 shadow">
              <p className="text-gray-600">
                Loading mentor management...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar role="MENTOR" />

      <div className="flex-1">

        {/* NAVBAR */}
        <Navbar title="Mentor Management" />

        <main className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Mentor Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your mentor profile, expertise,
              statistics and availability.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              MENTOR PROFILE
          ================================================= */}

          <div className="rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6 flex items-center gap-3">

              <User
                size={28}
                className="text-indigo-600"
              />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Mentor Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Your professional mentor information
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* NAME */}
              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {profile?.firstName || firstName}{" "}
                  {profile?.lastName || lastName}
                </p>

              </div>

              {/* EMAIL */}
              <div className="rounded-xl bg-gray-50 p-5">

                <div className="flex items-center gap-2">

                  <Mail size={18} />

                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                </div>

                <p className="mt-2 font-semibold text-slate-800">
                  {profile?.email || "Not available"}
                </p>

              </div>

              {/* EMPLOYEE ID */}
              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Employee ID
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {profile?.employeeId || employeeId}
                </p>

              </div>

              {/* DESIGNATION */}
              <div className="rounded-xl bg-gray-50 p-5">

                <div className="flex items-center gap-2">

                  <Briefcase size={18} />

                  <p className="text-sm text-gray-500">
                    Designation
                  </p>

                </div>

                <p className="mt-2 font-semibold text-slate-800">
                  {profile?.designation || "Technical Mentor"}
                </p>

              </div>

            </div>
          </div>

          {/* =================================================
              EXPERTISE
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6 flex items-center gap-3">

              <Award
                size={28}
                className="text-purple-600"
              />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Expertise
                </h2>

                <p className="text-sm text-gray-500">
                  Skills and areas where you can mentor employees.
                </p>
              </div>

            </div>

            {expertise.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

                <BookOpen
                  size={42}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 text-gray-600">
                  No expertise information available.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                {expertise.map((item, index) => (

                  <div
                    key={item.id || index}
                    className="rounded-xl border border-purple-100 bg-purple-50 p-5"
                  >

                    <div className="mb-3 flex items-center justify-between">

                      <BookOpen
                        size={22}
                        className="text-purple-600"
                      />

                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        EXPERTISE
                      </span>

                    </div>

                    <h3 className="font-semibold text-slate-800">
                      {item.skillName ||
                        item.name ||
                        item.expertise ||
                        "Expertise"}
                    </h3>

                    {item.proficiency && (
                      <p className="mt-2 text-sm text-gray-600">
                        Proficiency:{" "}
                        <span className="font-semibold">
                          {item.proficiency}
                        </span>
                      </p>
                    )}

                    {item.experienceYears && (
                      <p className="mt-1 text-sm text-gray-600">
                        Experience:{" "}
                        <span className="font-semibold">
                          {item.experienceYears} years
                        </span>
                      </p>
                    )}

                  </div>

                ))}

              </div>

            )}
          </div>

          {/* =================================================
              MENTOR STATISTICS
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6 flex items-center gap-3">

              <BarChart3
                size={28}
                className="text-blue-600"
              />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Mentor Statistics
                </h2>

                <p className="text-sm text-gray-500">
                  Overview of your mentoring profile.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* EXPERTISE */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Expertise Areas
                    </p>

                    <p className="mt-2 text-3xl font-bold text-blue-700">
                      {statistics.totalExpertise}
                    </p>
                  </div>

                  <Award
                    size={36}
                    className="text-blue-600"
                  />

                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Skills available for mentoring
                </p>

              </div>

              {/* MENTORING CAPACITY */}
              <div className="rounded-xl border border-green-100 bg-green-50 p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Mentoring Capacity
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-700">
                      {statistics.mentoringCapacity}
                    </p>
                  </div>

                  <Users
                    size={36}
                    className="text-green-600"
                  />

                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Maximum mentees at a time
                </p>

              </div>

              {/* AVAILABILITY */}
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Availability
                    </p>

                    <p className="mt-2 text-xl font-bold text-purple-700">
                      {statistics.availability}
                    </p>
                  </div>

                  <CheckCircle
                    size={36}
                    className="text-purple-600"
                  />

                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Current mentor availability
                </p>

              </div>

            </div>
          </div>

          {/* =================================================
              AVAILABILITY
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6 flex items-center gap-3">

              <CalendarDays
                size={28}
                className="text-green-600"
              />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Availability
                </h2>

                <p className="text-sm text-gray-500">
                  Manage when you are available for mentoring.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              {/* STATUS */}
              <div className="rounded-xl border border-gray-200 p-5">

                <p className="text-sm text-gray-500">
                  Availability Status
                </p>

                <div className="mt-3 flex items-center gap-3">

                  <span
                    className={`h-3 w-3 rounded-full ${
                      availability.status === "AVAILABLE"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />

                  <span
                    className={`font-semibold ${
                      availability.status === "AVAILABLE"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {availability.status}
                  </span>

                </div>

              </div>

              {/* WORKING HOURS */}
              <div className="rounded-xl border border-gray-200 p-5">

                <div className="flex items-center gap-2">

                  <Clock
                    size={20}
                    className="text-indigo-600"
                  />

                  <p className="text-sm text-gray-500">
                    Mentoring Hours
                  </p>

                </div>

                <p className="mt-3 font-semibold text-slate-800">
                  {availability.hours}
                </p>

              </div>

              {/* DAYS */}
              <div className="rounded-xl border border-gray-200 p-5">

                <div className="flex items-center gap-2">

                  <CalendarDays
                    size={20}
                    className="text-indigo-600"
                  />

                  <p className="text-sm text-gray-500">
                    Available Days
                  </p>

                </div>

                <p className="mt-3 font-semibold text-slate-800">
                  {availability.days}
                </p>

              </div>

            </div>

            {/* AVAILABILITY BUTTONS */}

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                onClick={() =>
                  handleAvailabilityChange("AVAILABLE")
                }
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium ${
                  availability.status === "AVAILABLE"
                    ? "bg-green-600 text-white"
                    : "border border-green-300 bg-white text-green-700 hover:bg-green-50"
                }`}
              >
                <CheckCircle size={18} />
                Available
              </button>

              <button
                onClick={() =>
                  handleAvailabilityChange("UNAVAILABLE")
                }
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium ${
                  availability.status === "UNAVAILABLE"
                    ? "bg-red-600 text-white"
                    : "border border-red-300 bg-white text-red-700 hover:bg-red-50"
                }`}
              >
                <Clock size={18} />
                Unavailable
              </button>

            </div>

            <div className="mt-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <Edit3 size={17} />
                <span>
                  Availability changes currently apply to this
                  mentor profile session. Backend persistence can
                  be connected when the availability API is ready.
                </span>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default MentorManagement;