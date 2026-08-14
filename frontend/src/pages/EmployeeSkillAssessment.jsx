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

  const [loading, setLoading] = useState(false);
  const [loadingExistingRole, setLoadingExistingRole] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // TARGET ROLES
  // IMPORTANT: IDs MUST MATCH DATABASE ROLE IDs
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
  // LOAD PREVIOUSLY SELECTED ROLE
  // =========================================================

  useEffect(() => {
    const storedRoleId = localStorage.getItem("targetRoleId");

    console.log(
      "Stored target role ID:",
      storedRoleId
    );

    if (storedRoleId) {
      const roleId = Number(storedRoleId);

      const role = targetRoles.find(
        (item) => item.id === roleId
      );

      if (role) {
        setSelectedRole(role);
        loadAssessment(roleId);
      } else {
        localStorage.removeItem("targetRoleId");
        localStorage.removeItem("targetRole");
        setLoadingExistingRole(false);
      }
    } else {
      setLoadingExistingRole(false);
    }
  }, []);

  // =========================================================
  // LOAD ROLE-SPECIFIC ASSESSMENT
  // =========================================================

  const loadAssessment = async (roleId) => {
    try {
      setLoading(true);
      setLoadingExistingRole(true);
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
        "Role-specific assessment response:",
        response.data
      );

      if (!response.data) {
        setError(
          "No assessment is available for this role."
        );
        return;
      }

      // Backend should return one assessment.
      // This also handles an array response safely.
      const roleAssessment = Array.isArray(
        response.data
      )
        ? response.data[0]
        : response.data;

      if (!roleAssessment) {
        setError(
          "No assessment is available for the selected role."
        );
        return;
      }

      console.log(
        "Selected role assessment:",
        roleAssessment
      );

      setAssessment(roleAssessment);

      // Store assessment ID so Assessment.jsx can
      // identify the same assessment if needed.
      if (roleAssessment.id) {
        localStorage.setItem(
          "targetAssessmentId",
          roleAssessment.id.toString()
        );
      }
    } catch (err) {
      console.error(
        "Error loading role-specific assessment:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      if (err.response?.status === 404) {
        setError(
          "No assessment is available for the selected role."
        );
      } else {
        setError(
          err.response?.data?.message ||
            `Unable to load assessment. Status: ${
              err.response?.status || "Unknown"
            }`
        );
      }
    } finally {
      setLoading(false);
      setLoadingExistingRole(false);
    }
  };

  // =========================================================
  // SELECT TARGET ROLE
  // =========================================================

  const handleRoleSelect = (role) => {
    console.log(
      "Selected target role:",
      role.name,
      "ID:",
      role.id
    );

    // Store target role
    localStorage.setItem(
      "targetRoleId",
      role.id.toString()
    );

    localStorage.setItem(
      "targetRole",
      role.name
    );

    // Remove previous assessment ID
    localStorage.removeItem(
      "targetAssessmentId"
    );

    setSelectedRole(role);

    // Load assessment for THIS role only
    loadAssessment(role.id);
  };

  // =========================================================
  // CHANGE ROLE
  // =========================================================

  const changeRole = () => {
    localStorage.removeItem("targetRoleId");
    localStorage.removeItem("targetRole");
    localStorage.removeItem("targetAssessmentId");

    setSelectedRole(null);
    setAssessment(null);
    setError("");
  };

  // =========================================================
  // START ASSESSMENT
  // =========================================================

  const startAssessment = () => {
    if (!selectedRole) {
      setError(
        "Please select a target role first."
      );
      return;
    }

    if (!assessment) {
      setError(
        "Assessment is not available for the selected role."
      );
      return;
    }

    console.log(
      "Starting assessment:",
      assessment.id,
      "for role:",
      selectedRole.name,
      "role ID:",
      selectedRole.id
    );

    // Ensure these values are available to Assessment.jsx
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
  // LOADING EXISTING ROLE
  // =========================================================

  if (loadingExistingRole && !selectedRole) {
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
                Select Your Target Role
              </h1>

            </div>

          </div>

          <p className="text-slate-500 max-w-3xl">
            Select the role you want to be assessed for.
            Your assessment will be customized according to
            the skills and competencies required for that role.
          </p>

        </div>

        {/* ===================================================
            TARGET ROLE CARDS
        =================================================== */}

        {!selectedRole && (
          <div>

            <div className="mb-5">

              <h2 className="text-lg font-bold text-slate-800">
                Choose a Target Role
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Select one role to continue with the
                role-specific skill assessment.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

              {targetRoles.map((role) => {

                const Icon = role.icon;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() =>
                      handleRoleSelect(role)
                    }
                    className="text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 group"
                  >

                    <div className="flex items-center justify-between mb-5">

                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition">

                        <Icon
                          size={25}
                          className="text-indigo-600"
                        />

                      </div>

                      <ArrowRight
                        size={20}
                        className="text-slate-300 group-hover:text-indigo-600 transition"
                      />

                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      {role.name}
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed">
                      {role.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100">

                      <span className="text-sm font-semibold text-indigo-600">
                        Select Role →
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>
        )}

        {/* ===================================================
            SELECTED ROLE
        =================================================== */}

        {selectedRole && (
          <>

            {/* SELECTED ROLE HEADER */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

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
                      Selected Target Role
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedRole.name}
                    </h2>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={changeRole}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  <RefreshCw size={17} />
                  Change Role
                </button>

              </div>

            </div>

            {/* LOADING */}

            {loading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
                <LoadingState />
              </div>
            )}

            {/* ERROR */}

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
                  onClick={() =>
                    loadAssessment(
                      selectedRole.id
                    )
                  }
                  className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>

              </div>
            )}

            {/* ASSESSMENT DETAILS */}

            {!loading &&
              !error &&
              assessment && (
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
                        assessment.questions?.length ||
                        0
                      }
                    />

                    <InfoCard
                      icon={Clock}
                      iconBg="bg-orange-100"
                      iconColor="text-orange-600"
                      label="Duration"
                      value={`${
                        assessment.durationMinutes ||
                        30
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
                          This assessment is designed according
                          to the selected target role.
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
                          assessment.durationMinutes ||
                          30
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
                        text={`The assessment is specific to the ${selectedRole.name} role.`}
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