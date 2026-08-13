import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Clock,
  HelpCircle,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function EmployeeSkillAssessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ACTIVE ASSESSMENT
  // =========================================================

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/assessments/active");

      console.log(
        "Active assessments:",
        response.data
      );

      const activeAssessments =
        Array.isArray(response.data)
          ? response.data
          : [];

      if (activeAssessments.length === 0) {
        setError(
          "No active skill assessment is available right now."
        );
        return;
      }

      // Use the active assessment
      setAssessment(activeAssessments[0]);
    } catch (err) {
      console.error(
        "Error loading assessment:",
        err
      );

      setError(
        err.response?.data?.message ||
          `Unable to load assessment. Status: ${
            err.response?.status || "Unknown"
          }`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // START ASSESSMENT
  // =========================================================

  const startAssessment = () => {
    navigate("/employee/assessment");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar
          role={
            localStorage.getItem("role") ||
            "EMPLOYEE"
          }
        />

        <div className="flex-1 min-w-0">

          <Navbar title="Skill Assessment" />

          <div className="flex items-center justify-center min-h-[80vh]">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

              <p className="text-slate-500">
                Loading skill assessment...
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar
          role={
            localStorage.getItem("role") ||
            "EMPLOYEE"
          }
        />

        <div className="flex-1 min-w-0">

          <Navbar title="Skill Assessment" />

          <div className="flex items-center justify-center min-h-[80vh] p-6">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-lg w-full text-center">

              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">

                <AlertCircle
                  size={34}
                  className="text-red-500"
                />

              </div>

              <h2 className="text-xl font-bold text-slate-800">
                Assessment Unavailable
              </h2>

              <p className="text-slate-500 mt-2">
                {error}
              </p>

              <button
                onClick={loadAssessment}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // NO ASSESSMENT
  // =========================================================

  if (!assessment) {
    return (
      <div className="flex min-h-screen bg-slate-50">

        <Sidebar
          role={
            localStorage.getItem("role") ||
            "EMPLOYEE"
          }
        />

        <div className="flex-1 min-w-0">

          <Navbar title="Skill Assessment" />

          <div className="flex items-center justify-center min-h-[80vh] p-6">

            <div className="text-center">

              <AlertCircle
                size={40}
                className="text-orange-500 mx-auto mb-4"
              />

              <h2 className="text-xl font-bold text-slate-800">
                No Assessment Available
              </h2>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role={
          localStorage.getItem("role") ||
          "EMPLOYEE"
        }
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 min-w-0">

        <Navbar title="Skill Assessment" />

        <main className="p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>

                <div className="flex items-center gap-4 mb-4">

                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">

                    <ClipboardCheck
                      size={28}
                      className="text-indigo-600"
                    />

                  </div>

                  <div>

                    <p className="text-sm text-indigo-600 font-semibold">
                      Employee Skill Assessment
                    </p>

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                      {assessment.title}
                    </h1>

                  </div>

                </div>

                <p className="text-slate-500 leading-relaxed max-w-3xl">
                  {assessment.description}
                </p>

              </div>

              {/* Start button */}

              <button
                onClick={startAssessment}
                className="shrink-0 flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm"
              >

                <PlayCircle size={21} />

                Start Assessment

                <ArrowRight size={18} />

              </button>

            </div>

          </div>

          {/* =================================================
              ASSESSMENT INFO
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            {/* Questions */}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">

                  <HelpCircle
                    size={23}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Total Questions
                  </p>

                  <p className="text-2xl font-bold text-slate-800">
                    30
                  </p>

                </div>

              </div>

            </div>

            {/* Duration */}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-lg bg-orange-100 flex items-center justify-center">

                  <Clock
                    size={23}
                    className="text-orange-600"
                  />

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Duration
                  </p>

                  <p className="text-2xl font-bold text-slate-800">
                    {assessment.durationMinutes || 30} min
                  </p>

                </div>

              </div>

            </div>

            {/* Assessment Type */}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">

                  <CheckCircle
                    size={23}
                    className="text-green-600"
                  />

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Assessment Type
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    Technical Skills
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              WHAT WILL BE ASSESSED
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">

                <BookOpen size={21} />

              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Skills Covered
                </h2>

                <p className="text-sm text-slate-500">
                  The assessment evaluates the following technical areas.
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              {[
                "Java",
                "Spring Boot",
                "SQL",
                "React",
                "DSA",
              ].map((skill) => (

                <span
                  key={skill}
                  className="px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium"
                >
                  {skill}
                </span>

              ))}

            </div>

          </div>

          {/* =================================================
              INSTRUCTIONS
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h2 className="text-lg font-bold text-slate-800 mb-5">
              Before You Start
            </h2>

            <div className="space-y-4">

              <Instruction
                text="The assessment contains multiple-choice questions."
              />

              <Instruction
                text="You have 30 minutes to complete the assessment."
              />

              <Instruction
                text="Each question has one correct answer."
              />

              <Instruction
                text="You can move between questions using Previous, Next, or the question navigator."
              />

              <Instruction
                text="Your skill-wise performance will be calculated after submission."
              />

              <Instruction
                text="Make sure you have enough time before starting the assessment."
              />

            </div>

            {/* Bottom Start */}

            <div className="mt-7 pt-6 border-t border-slate-200">

              <button
                onClick={startAssessment}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
              >

                <PlayCircle size={20} />

                Start Assessment

                <ArrowRight size={18} />

              </button>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

// =========================================================
// INSTRUCTION COMPONENT
// =========================================================

function Instruction({ text }) {
  return (
    <div className="flex items-start gap-3">

      <CheckCircle
        size={20}
        className="text-green-500 mt-0.5 shrink-0"
      />

      <p className="text-slate-600">
        {text}
      </p>

    </div>
  );
}

export default EmployeeSkillAssessment;