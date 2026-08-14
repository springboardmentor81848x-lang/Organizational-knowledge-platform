import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Building2,
  Shield,
  Lock,
  Edit3,
  Save,
  X,
  KeyRound,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Profile() {

  const employeeId =
    localStorage.getItem("employeeId");

  const role =
    localStorage.getItem("role") || "EMPLOYEE";


  // =========================================================
  // STATE
  // =========================================================

  const [profile, setProfile] =
    useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {

    if (employeeId) {

      loadProfile();

    } else {

      setLoading(false);

    }

  }, [employeeId]);


  const loadProfile = async () => {

    try {

      const response =
        await api.get(
          `/employees/profile/${employeeId}`
        );

      setProfile(response.data);

      setFormData({
        employeeId:
          response.data.employeeId || "",

        firstName:
          response.data.firstName || "",

        lastName:
          response.data.lastName || "",

        email:
          response.data.email || "",

        password: "",
      });

    } catch (error) {

      console.error(
        "Error loading profile:",
        error
      );

      alert(
        "Unable to load profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =========================================================
  // EDIT PROFILE
  // =========================================================

  const handleEdit = () => {

    setIsEditing(true);

  };


  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancel = () => {

    setFormData({

      employeeId:
        profile.employeeId || "",

      firstName:
        profile.firstName || "",

      lastName:
        profile.lastName || "",

      email:
        profile.email || "",

      password: "",

    });

    setIsEditing(false);

  };


  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {

    if (!formData.firstName.trim()) {

      alert(
        "First name is required."
      );

      return;
    }

    if (!formData.lastName.trim()) {

      alert(
        "Last name is required."
      );

      return;
    }

    if (!formData.email.trim()) {

      alert(
        "Email is required."
      );

      return;
    }

    try {

      setSaving(true);

      const updateData = {

        employeeId:
          formData.employeeId,

        firstName:
          formData.firstName,

        lastName:
          formData.lastName,

        email:
          formData.email,

      };


      // -----------------------------------------------------
      // ONLY SEND PASSWORD IF CHANGED
      // -----------------------------------------------------

      if (
        formData.password.trim()
      ) {

        updateData.password =
          formData.password;

      }


      const response =
        await api.put(
          `/employees/profile/${employeeId}`,
          updateData
        );


      setProfile(
        response.data
      );


      setFormData({

        employeeId:
          response.data.employeeId || "",

        firstName:
          response.data.firstName || "",

        lastName:
          response.data.lastName || "",

        email:
          response.data.email || "",

        password: "",

      });


      // -----------------------------------------------------
      // UPDATE LOCAL STORAGE
      // -----------------------------------------------------

      localStorage.setItem(
        "firstName",
        response.data.firstName || ""
      );

      localStorage.setItem(
        "lastName",
        response.data.lastName || ""
      );


      setIsEditing(false);

      alert(
        "Profile updated successfully!"
      );

    } catch (error) {

      console.error(
        "Error updating profile:",
        error
      );

      alert(
        error.response?.data ||
        "Unable to update profile."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex min-h-screen bg-slate-100">

        <Sidebar role={role} />

        <main className="flex-1 flex items-center justify-center">

          <p className="text-lg text-slate-600">
            Loading profile...
          </p>

        </main>

      </div>

    );

  }


  // =========================================================
  // PROFILE NOT FOUND
  // =========================================================

  if (!profile) {

    return (

      <div className="flex min-h-screen bg-slate-100">

        <Sidebar role={role} />

        <main className="flex-1 flex items-center justify-center">

          <div className="bg-white p-8 rounded-xl shadow">

            <h2 className="text-xl font-semibold text-red-600">
              Profile not found
            </h2>

            <p className="text-slate-500 mt-2">
              Please log in again.
            </p>

          </div>

        </main>

      </div>

    );

  }


  // =========================================================
  // DISPLAY DATA
  // =========================================================

  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`
      .trim();


  const departmentName =
    profile.department?.departmentName ||
    profile.department?.name ||
    "Not assigned";


  const roleName =
    profile.role?.roleName ||
    role ||
    "Employee";


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="flex min-h-screen bg-slate-100">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar role={role} />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-1 overflow-y-auto">


        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8">

          <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center">

            <User
              size={26}
              className="text-indigo-600"
            />

          </div>

        </header>


        <div className="p-8 max-w-6xl mx-auto">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>

              <h1 className="text-4xl font-bold text-slate-900">
                My Profile
              </h1>

              <p className="text-slate-500 mt-2">
                View and update your personal information.
              </p>

            </div>


            {!isEditing ? (

              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium transition"
              >

                <Edit3 size={18} />

                Edit Profile

              </button>

            ) : (

              <div className="flex gap-3">

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium"
                >

                  <X size={18} />

                  Cancel

                </button>


                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium"
                >

                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            )}

          </div>


          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">

            <div className="flex flex-col md:flex-row md:items-center gap-6">

              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">

                <User
                  size={48}
                  className="text-indigo-600"
                />

              </div>


              <div className="flex-1">

                <h2 className="text-3xl font-bold text-slate-900">
                  {fullName || "Employee"}
                </h2>

                <div className="flex items-center gap-2 mt-2 text-slate-400">

                  <span>
                    Employee ID:
                  </span>

                  <span className="font-semibold text-slate-600">
                    {profile.employeeId}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">

            <div className="flex items-center gap-3 mb-7">

              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">

                <User
                  size={22}
                  className="text-indigo-600"
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-sm text-slate-500">
                  Your basic personal information
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              {/* EMPLOYEE ID */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Employee ID
                </label>

                <div className="relative">

                  <input
                    type="text"
                    value={formData.employeeId}
                    disabled
                    className="w-full px-4 py-3 pr-11 rounded-lg border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />

                  <Lock
                    size={18}
                    className="absolute right-4 top-3.5 text-slate-400"
                  />

                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Employee ID cannot be changed.
                </p>

              </div>


              {/* FIRST NAME */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name
                </label>

                {isEditing ? (

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                ) : (

                  <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">

                    {profile.firstName ||
                      "Not provided"}

                  </div>

                )}

              </div>


              {/* LAST NAME */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>

                {isEditing ? (

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                ) : (

                  <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">

                    {profile.lastName ||
                      "Not provided"}

                  </div>

                )}

              </div>


              {/* EMAIL */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                {isEditing ? (

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                ) : (

                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">

                    <Mail
                      size={18}
                      className="text-slate-400"
                    />

                    {profile.email ||
                      "Not provided"}

                  </div>

                )}

              </div>

            </div>

          </div>


          {/* =================================================
              ORGANIZATIONAL INFORMATION
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">

            <div className="flex items-center gap-3 mb-7">

              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">

                <Building2
                  size={22}
                  className="text-slate-600"
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Organizational Information
                </h2>

                <p className="text-sm text-slate-500">
                  Your organization and system role
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              {/* DEPARTMENT */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department
                </label>

                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">

                  <Building2
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="text-slate-800">
                    {departmentName}
                  </span>

                </div>

              </div>


              {/* SYSTEM ROLE */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  System Role
                </label>

                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">

                  <Shield
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="text-slate-800">
                    {roleName}
                  </span>

                </div>

              </div>

            </div>


            <div className="mt-5 p-4 rounded-lg bg-amber-50 border border-amber-200">

              <p className="text-sm text-amber-700">

                <strong>Note:</strong>{" "}
                Department and system role are managed
                by authorized personnel.

              </p>

            </div>

          </div>


          {/* =================================================
              ACCOUNT & SECURITY
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

            <div className="flex items-center gap-3 mb-7">

              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">

                <KeyRound
                  size={22}
                  className="text-emerald-600"
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Account & Security
                </h2>

                <p className="text-sm text-slate-500">
                  Manage your account password
                </p>

              </div>

            </div>


            {isEditing ? (

              <div className="max-w-xl">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Only enter a password if you want to change it.
                </p>

              </div>

            ) : (

              <div className="flex items-center gap-3 text-slate-600">

                <Lock size={18} />

                <span>
                  Password is securely protected.
                </span>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>

  );
}

export default Profile;