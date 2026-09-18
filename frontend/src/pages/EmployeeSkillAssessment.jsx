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
  Code2,
  Bug,
  BarChart3,
  Brain,
  Server,
  Palette,
  ShieldCheck,
  Database,
  RefreshCw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function EmployeeSkillAssessment() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // TARGET ROLES
  // These IDs MUST match assessment_role_id in database
  // =========================================================

  const targetRoles = [
    {
      id: 1,
      name: "Software Developer",
      description:
        "Assess programming, software development and application development skills.",
      icon: Code2,
    },
    {
      id: 2,
      name: "Software Tester",
      description:
        "Assess software testing, quality assurance and debugging skills.",
      icon: Bug,
    },
    {
      id: 3,
      name: "Data Analyst",
      description:
        "Assess data analysis, SQL, Excel, visualization and reporting skills.",
      icon: BarChart3,
    },
    {
      id: 4,
      name: "Data Scientist",
      description:
        "Assess data science, statistics, machine learning and Python skills.",
      icon: Brain,
    },
    {
      id: 5,
      name: "DevOps Engineer",
      description:
        "Assess DevOps, CI/CD, cloud, deployment and infrastructure skills.",
      icon: Server,
    },
    {
      id: 6,
      name: "UI/UX Designer",
      description:
        "Assess UI design, UX principles, prototyping and design thinking skills.",
      icon: Palette,
    },
    {
      id: 7,
      name: "Cybersecurity Analyst",
      description:
        "Assess cybersecurity, network security, threats and security analysis skills.",
      icon: ShieldCheck,
    },
    {
      id: 8,
      name: "Database Administrator",
      description:
        "Assess database management, SQL, optimization and administration skills.",
      icon: Database,
    },
  ];

  // =========================================================
  // LOAD EMPLOYEE'S SAVED TARGET ROLE
  // =========================================================

  useEffect(() => {
    loadEmployeeTargetRole();
  }, []);

  const loadEmployeeTargetRole = async () => {
    try {
      setLoading(true);
      setError("");

      const employeeId = localStorage.getItem("employeeId");

      console.log("Logged-in employee ID:", employeeId);

      if (!employeeId) {
        setError("Employee information is not available. Please login again.");
        return;
      }

      /*
       * TEMPORARY:
       * We first try localStorage because your Signup currently
       * stores targetRoleId there.
       *
       * After we update the backend Signup flow, this will come
       * directly from employee.target_role_id in the database.
       */

      const storedTargetRoleId =
        localStorage.getItem("targetRoleId");

      if (!storedTargetRoleId) {
        setError(
          "No target role has been selected for this employee."
        );
        return;
      }

      const targetRoleId = Number(storedTargetRoleId);

      const role = targetRoles.find(
        (item) => item.id === targetRoleId
      );

      if (!role) {
        setError("Invalid target role.");
        return;
      }

      console.log(
        "Employee target role:",
        role.name,
        "ID:",
        role.id
      );

      setSelectedRole(role);

      await loadAssessment(role.id);
    } catch (err) {
      console.error(
        "Error loading employee target role:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load target role."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ROLE-SPECIFIC ASSESSMENT
  // =========================================================

  const loadAssessment = async (roleId) => {
    try {
      setLoading(true);
      setError("");
      setAssessment(null);

      console.log(
        "Loading assessment for target role ID:",
        roleId
      );

      const response = await api.get(
        `/assessments/role/${roleId}`
      );

      console.log(
        "Assessment response:",
        response.data
      );

      if (!response.data) {
        setError(
          "No assessment is available for this target role."
        );
        return;
      }

      const roleAssessment = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (!roleAssessment) {
        setError(
          "No assessment is available for this target role."
        );
        return;
      }

      console.log(
        "Selected assessment:",
        roleAssessment
      );

      setAssessment(roleAssessment);

      // Save assessment ID for Assessment.jsx
      if (roleAssessment.id) {
        localStorage.setItem(
          "targetAssessmentId",
          roleAssessment.id.toString()
        );
      }
    } catch (err) {
      console.error(
        "Error loading assessment:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      if (err.response?.status === 404) {
        setError(
          "No assessment is available for this target role."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load assessment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // START ASSESSMENT
  // =========================================================

  const startAssessment = () => {
    if (!selectedRole) {
      setError("Target role is not available.");
      return;
    }

    if (!assessment) {
      setError(
        "Assessment is not available for this target role."
      );
      return;
    }

    console.log(
      "Starting assessment:",
      assessment.id
    );

    console.log(
      "Target role:",
      selectedRole.name,
      selectedRole.id
    );

    localStorage.setItem(
      "targetRoleId",
      selectedRole.id.toString()
    );

    localStorage.setItem(
      "targetRole",
      selectedRole.name
    );

    localStorage.setItem(
      "targetAssessmentId",
      assessment.id.toString()
    );

    navigate("/employee/assessment");
  };

  // =========================================================
  // RETRY
  // =========================================================

  const retry = () => {
    loadEmployeeTargetRole();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !selectedRole) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <LoadingState />
        </div>
      </PageLayout>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <PageLayout>
      <main className="p-5 md:p-8">

        {/* PAGE HEADER */}

        <div className="mb-8">

          <div className="flex items-center gap-4 mb-3">

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
                Role-Specific Assessment
              </h1>

            </div>

          </div>

          <p className="text-slate-500 max-w-3xl">
            Your assessment is automatically selected based
            on your target role.
          </p>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (

          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">

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
              onClick={retry}
              className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >

              <RefreshCw size={18} />

              Try Again

            </button>

          </div>

        )}

        {/* ===================================================
            SELECTED ROLE
        =================================================== */}

        {!error && selectedRole && (

          <>

            {/* TARGET ROLE */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">

                  {(() => {

                    const Icon = selectedRole.icon;

                    return (
                      <Icon
                        size={28}
                        className="text-indigo-600"
                      />
                    );

                  })()}

                </div>

                <div>

                  <p className="text-sm text-indigo-600 font-semibold">
                    Your Target Role
                  </p>

                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedRole.name}
                  </h2>

                </div>

              </div>

            </div>

            {/* LOADING ASSESSMENT */}

            {loading && (

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 mb-6">

                <LoadingState />

              </div>

            )}

            {/* ASSESSMENT */}

            {!loading && assessment && (

              <>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                    <div>

                      <div className="flex items-center gap-3 mb-3">

                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                          Role-Specific Assessment
                        </span>

                      </div>

                      <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                        {assessment.title}
                      </h1>

                      <p className="text-slate-500 mt-3 leading-relaxed max-w-3xl">
                        {assessment.description}
                      </p>

                    </div>

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

                {/* ASSESSMENT INFO */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

                  <InfoCard
                    icon={HelpCircle}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    label="Total Questions"
                    value={
                      assessment.questions?.length || 0
                    }
                  />

                  <InfoCard
                    icon={Clock}
                    iconBg="bg-orange-100"
                    iconColor="text-orange-600"
                    label="Duration"
                    value={`${
                      assessment.durationMinutes || 30
                    } min`}
                  />

                  <InfoCard
                    icon={CheckCircle}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    label="Assessment Type"
                    value="Technical Skills"
                  />

                </div>

                {/* ROLE DESCRIPTION */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">

                      <BookOpen size={21} />

                    </div>

                    <div>

                      <h2 className="text-lg font-bold text-slate-800">
                        Assessment for{" "}
                        {selectedRole.name}
                      </h2>

                      <p className="text-sm text-slate-500">
                        This assessment is based on your
                        selected target role.
                      </p>

                    </div>

                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">

                    <p className="text-indigo-800 leading-relaxed">

                      You are about to take the{" "}
                      <strong>
                        {selectedRole.name}
                      </strong>{" "}
                      skill assessment. Your performance
                      will be evaluated against the skills
                      expected for this role.

                    </p>

                  </div>

                </div>

                {/* INSTRUCTIONS */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                  <h2 className="text-lg font-bold text-slate-800 mb-5">
                    Before You Start
                  </h2>

                  <div className="space-y-4">

                    <Instruction
                      text="The assessment contains multiple-choice questions."
                    />

                    <Instruction
                      text={`You have ${
                        assessment.durationMinutes || 30
                      } minutes to complete the assessment.`}
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
                      text={`This assessment is specifically designed for the ${selectedRole.name} target role.`}
                    />

                  </div>

                  <div className="mt-7 pt-6 border-t border-slate-200">

                    <button
                      onClick={startAssessment}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                    >

                      <PlayCircle size={20} />

                      Start{" "}
                      {selectedRole.name}{" "}
                      Assessment

                      <ArrowRight size={18} />

                    </button>

                  </div>

                </div>

              </>

            )}

          </>

        )}

      </main>
    </PageLayout>
  );
}

// =========================================================
// PAGE LAYOUT
// =========================================================

function PageLayout({ children }) {
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

        {children}

      </div>

    </div>
  );
}

// =========================================================
// LOADING STATE
// =========================================================

function LoadingState() {
  return (
    <div className="text-center">

      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

      <p className="text-slate-500">
        Loading skill assessment...
      </p>

    </div>
  );
}

// =========================================================
// INFO CARD
// =========================================================

function InfoCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

      <div className="flex items-center gap-4">

        <div
          className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center`}
        >

          <Icon
            size={23}
            className={iconColor}
          />

        </div>

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// INSTRUCTION
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