import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  ClipboardCheck,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function PeerAssessment() {
  // Business employee ID such as EMP1001
  const employeeId =
    localStorage.getItem("employeeId");

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD PEER EMPLOYEES
  // =========================================================

  useEffect(() => {
    loadPeerEmployees();
  }, []);

  const loadPeerEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        throw new Error(
          "Employee ID not found. Please login again."
        );
      }

      const response = await api.get(
        `/peer-assessment/employees/${employeeId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      console.log(
        "Peer employees:",
        data
      );

      setEmployees(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Peer assessment loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Unable to load peer assessment assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECT EMPLOYEE
  // =========================================================

  const handleSelectEmployee = async (
    employee
  ) => {
    setSelectedEmployee(employee);
    setSuccess("");
    setError("");
    setRatings({});
    setSkills([]);

    try {
      /*
       * IMPORTANT:
       * Backend PeerEmployeeResponse uses employeeId
       * such as EMP1002.
       *
       * Do NOT use employee.id here.
       */

      const evaluatedEmployeeId =
        employee.employeeId;

      if (!evaluatedEmployeeId) {
        throw new Error(
          "Employee identifier is missing."
        );
      }

      const response = await api.get(
        `/peer-assessment/employees/${evaluatedEmployeeId}/skills`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      console.log(
        "Skills of selected employee:",
        data
      );

      setSkills(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Skill loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Unable to load skills for this employee."
      );
    }
  };

  // =========================================================
  // UPDATE RATING
  // =========================================================

  const handleRatingChange = (
    skillName,
    rating
  ) => {
    setRatings((previous) => ({
      ...previous,
      [skillName]: Number(rating),
    }));
  };

  // =========================================================
  // SUBMIT PEER ASSESSMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      setError(
        "Please select an employee."
      );
      return;
    }

    if (skills.length === 0) {
      setError(
        "No skills available for assessment."
      );
      return;
    }

    // Check whether all skills have been rated
    const unansweredSkills =
      skills.filter((skill) => {
        const skillName =
          skill.skillName ||
          skill.skill?.skillName;

        return !ratings[skillName];
      });

    if (unansweredSkills.length > 0) {
      setError(
        "Please provide a rating for every skill."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      /*
       * Backend expects:
       *
       * {
       *   employeeIdentifier: "EMP1002",
       *   ratings: [
       *     {
       *       skillName: "Java",
       *       level: 4
       *     }
       *   ]
       * }
       */

      const assessmentData = {
        employeeIdentifier:
          selectedEmployee.employeeId,

        ratings: skills.map((skill) => {
          const skillName =
            skill.skillName ||
            skill.skill?.skillName;

          return {
            skillName: skillName,
            level: ratings[skillName],
          };
        }),
      };

      console.log(
        "Submitting Peer Assessment:",
        assessmentData
      );

      const response = await api.post(
        `/peer-assessment/submit/${employeeId}`,
        assessmentData
      );

      const result = response.data;

      console.log(
        "Peer assessment result:",
        result
      );

      setSuccess(
        `Peer assessment for ${
          selectedEmployee.firstName
        } ${
          selectedEmployee.lastName || ""
        } submitted successfully!`
      );

      // Clear form
      setRatings({});

      // Remove completed employee from list
      setEmployees((previous) =>
        previous.filter(
          (item) =>
            item.employeeId !==
            selectedEmployee.employeeId
        )
      );

      setSelectedEmployee(null);
      setSkills([]);
    } catch (err) {
      console.error(
        "Peer assessment submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Unable to submit peer assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LEVEL NAMES
  // =========================================================

  const levelNames = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competent",
    4: "Advanced",
    5: "Expert",
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen">

        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">

          <Navbar title="Peer Assessment" />

          <main className="p-8">

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-600">
                Loading peer assessments...
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

      <Sidebar role="EMPLOYEE" />

      <div className="flex-1">

        <Navbar title="Peer Assessment" />

        <main className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="p-3 bg-indigo-100 rounded-xl">

                <Users
                  size={28}
                  className="text-indigo-600"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-800">
                  Peer Assessment
                </h1>

                <p className="text-gray-500 mt-1">
                  Evaluate the skills and proficiency
                  of your assigned peers.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">

              <CheckCircle size={20} />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">

              <AlertCircle size={20} />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              EMPLOYEE SELECTION
          ================================================= */}

          {!selectedEmployee && (
            <div className="bg-white rounded-2xl shadow p-6">

              <div className="flex items-center gap-3 mb-6">

                <ClipboardCheck
                  size={24}
                  className="text-indigo-600"
                />

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Assigned Peer Assessments
                  </h2>

                  <p className="text-sm text-gray-500">
                    Select an employee to evaluate.
                  </p>

                </div>

              </div>

              {employees.length === 0 ? (

                <div className="text-center py-12">

                  <Users
                    size={50}
                    className="mx-auto text-gray-300 mb-4"
                  />

                  <h3 className="text-lg font-semibold text-gray-700">
                    No Pending Peer Assessments
                  </h3>

                  <p className="text-gray-500 mt-2">
                    You currently have no peer
                    assessments assigned to you.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {employees.map(
                    (employee) => (
                      <div
                        key={
                          employee.employeeId
                        }
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                      >

                        <div className="flex items-center gap-4">

                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">

                            <span className="text-indigo-700 font-bold text-lg">

                              {employee.firstName
                                ?.charAt(0)
                                ?.toUpperCase()}

                            </span>

                          </div>

                          <div>

                            <h3 className="font-semibold text-slate-800">

                              {employee.firstName}{" "}

                              {employee.lastName ||
                                ""}

                            </h3>

                            <p className="text-sm text-gray-500">
                              {employee.designation ||
                                "Employee"}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {employee.employeeId}
                            </p>

                          </div>

                        </div>

                        <div className="mt-5">

                          <button
                            onClick={() =>
                              handleSelectEmployee(
                                employee
                              )
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition"
                          >
                            Start Assessment
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================================
              ASSESSMENT FORM
          ================================================= */}

          {selectedEmployee && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* EMPLOYEE CARD */}

              <div className="bg-white rounded-2xl shadow p-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">

                      <Users
                        size={28}
                        className="text-indigo-600"
                      />

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">
                        Assessing
                      </p>

                      <h2 className="text-xl font-bold text-slate-800">

                        {selectedEmployee.firstName}{" "}

                        {selectedEmployee.lastName ||
                          ""}

                      </h2>

                      <p className="text-sm text-gray-500">
                        {selectedEmployee.designation ||
                          "Employee"}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {selectedEmployee.employeeId}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setSkills([]);
                      setRatings({});
                      setError("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Back
                  </button>

                </div>

              </div>

              {/* SKILLS */}

              <div className="bg-white rounded-2xl shadow p-6">

                <div className="mb-6">

                  <h2 className="text-xl font-bold text-slate-800">
                    Skill Evaluation
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Rate your peer based on your
                    observation of their proficiency.
                  </p>

                </div>

                {skills.length === 0 ? (

                  <div className="text-center py-10">

                    <p className="text-gray-500">
                      No skills available for
                      assessment.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-5">

                    {skills.map((skill) => {

                      const skillName =
                        skill.skillName ||
                        skill.skill?.skillName;

                      return (
                        <div
                          key={skill.id}
                          className="border border-gray-200 rounded-xl p-5"
                        >

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            {/* SKILL NAME */}

                            <div>

                              <h3 className="font-semibold text-lg text-slate-800">

                                {skillName ||
                                  "Unknown Skill"}

                              </h3>

                              <p className="text-sm text-gray-500 mt-1">
                                Select proficiency level
                              </p>

                            </div>

                            {/* RATINGS */}

                            <div className="flex flex-wrap gap-2">

                              {[1, 2, 3, 4, 5].map(
                                (level) => {

                                  const selected =
                                    ratings[
                                      skillName
                                    ] ===
                                    level;

                                  return (
                                    <button
                                      type="button"
                                      key={level}
                                      onClick={() =>
                                        handleRatingChange(
                                          skillName,
                                          level
                                        )
                                      }
                                      className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition ${
                                        selected
                                          ? "bg-indigo-600 text-white border-indigo-600 shadow"
                                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50"
                                      }`}
                                    >

                                      <Star
                                        size={16}
                                        className={
                                          selected
                                            ? "fill-current"
                                            : ""
                                        }
                                      />

                                      <span className="text-xs font-bold mt-1">
                                        {level}
                                      </span>

                                    </button>
                                  );
                                }
                              )}

                            </div>

                          </div>

                          {/* SELECTED LEVEL */}

                          {ratings[skillName] && (
                            <div className="mt-4 text-sm text-indigo-600 font-medium">

                              Selected:{" "}

                              {
                                levelNames[
                                  ratings[
                                    skillName
                                  ]
                                ]
                              }

                              {" "}

                              (
                              {
                                ratings[
                                  skillName
                                ]
                              }
                              /5)

                            </div>
                          )}

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

              {/* SUBMIT */}

              {skills.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-6">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="font-semibold text-slate-800">
                        Ready to submit?
                      </p>

                      <p className="text-sm text-gray-500">
                        Make sure you have rated every
                        skill before submitting.
                      </p>

                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      {submitting
                        ? "Submitting..."
                        : "Submit Peer Assessment"}
                    </button>

                  </div>

                </div>
              )}

            </form>
          )}

        </main>

      </div>
    </div>
  );
}

export default PeerAssessment;