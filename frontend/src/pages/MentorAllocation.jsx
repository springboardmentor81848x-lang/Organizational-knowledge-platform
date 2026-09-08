import React, { useEffect, useState } from "react";

import {
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getEmployees,
  allocateMentor,
} from "../services/MentorAllocationService";

import { getEmployeeSkills } from "../services/platformService";

import api from "../services/api";

// ============================================================
// AUTH HEADERS
// ============================================================

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: token
        ? `Bearer ${token}`
        : "",
    },
  };
};

function MentorAllocation() {
  // ============================================================
  // STATE
  // ============================================================

  const [employees, setEmployees] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [recommendedMentors, setRecommendedMentors] =
    useState([]);

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [selectedSkillGap, setSelectedSkillGap] =
    useState("");

  const [selectedMentor, setSelectedMentor] =
    useState("");

  const [loadingEmployees, setLoadingEmployees] =
    useState(false);

  const [loadingGaps, setLoadingGaps] =
    useState(false);

  const [loadingMentors, setLoadingMentors] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ============================================================
  // NORMALIZE ROLE
  // ============================================================

  const normalizeRole = (role) => {
    if (!role) {
      return "";
    }

    if (typeof role === "object") {
      role =
        role.name ||
        role.roleName ||
        role.authority ||
        role.authorityName ||
        "";
    }

    return String(role)
      .toUpperCase()
      .replace("ROLE_", "")
      .replace(/\_/g, " ")
      .trim();
  };

  // ============================================================
  // LOAD EMPLOYEES
  // ============================================================

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      setErrorMessage("");

      const response = await getEmployees();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      // --------------------------------------------------------
      // ONLY EMPLOYEE ROLE
      // --------------------------------------------------------

      const employeeUsers = data.filter((user) => {
        const role =
          user.role ||
          user.userRole ||
          user.roleName ||
          user.authority ||
          user.authorities;

        if (Array.isArray(role)) {
          return role.some(
            (item) =>
              normalizeRole(item) === "EMPLOYEE"
          );
        }

        return (
          normalizeRole(role) === "EMPLOYEE"
        );
      });

      setEmployees(employeeUsers);
    } catch (error) {
      console.error(
        "Error loading employees:",
        error
      );

      setEmployees([]);

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to load employees."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  // ============================================================
  // EMPLOYEE IDENTIFIER
  // ============================================================

  const getEmployeeIdentifier = (employee) => {
    return (
      employee?.employeeId ||
      employee?.employeeCode ||
      employee?.identifier ||
      employee?.username ||
      employee?.id
    );
  };

  // ============================================================
  // EMPLOYEE SELECT
  // ============================================================

  const handleEmployeeChange = async (e) => {
    const employeeIdentifier =
      e.target.value;

    setSelectedEmployee(
      employeeIdentifier
    );

    setSelectedSkillGap("");
    setSelectedMentor("");
    setRecommendedMentors([]);
    setSuccessMessage("");
    setErrorMessage("");

    if (!employeeIdentifier) {
      setSkillGaps([]);
      return;
    }

    await loadSkillGaps(
      employeeIdentifier
    );
  };

  // ============================================================
  // LEVEL TO PERCENTAGE
  // SAME LOGIC AS KNOWLEDGE GAP ANALYSIS
  // ============================================================

  const levelToPercentage = (level) => {
    const numericLevel =
      Number(level) || 0;

    if (numericLevel <= 1) {
      return 20;
    }

    if (numericLevel === 2) {
      return 40;
    }

    if (numericLevel === 3) {
      return 60;
    }

    if (numericLevel === 4) {
      return 80;
    }

    if (numericLevel >= 5) {
      return 100;
    }

    return 0;
  };

  // ============================================================
  // GAP STATUS
  // ============================================================

  const getGapStatus = (gapPercentage) => {
    const gap =
      Number(gapPercentage) || 0;

    if (gap <= 0) {
      return "No Gap";
    }

    if (gap <= 10) {
      return "Low";
    }

    if (gap <= 25) {
      return "Medium";
    }

    if (gap <= 40) {
      return "High";
    }

    return "Critical";
  };

  // ============================================================
  // GET SKILL GAP STATUS
  // ============================================================

  const getSkillGapStatus = (gap) => {
    const currentLevel =
      Number(
        gap?.currentLevel
      ) || 0;

    const requiredLevel =
      Number(
        gap?.requiredLevel
      ) || 0;

    const requiredScore = 70;

    const currentScore =
      levelToPercentage(
        currentLevel
      );

    const percentageGap =
      Math.max(
        requiredScore -
          currentScore,
        0
      );

    return getGapStatus(
      percentageGap
    );
  };

  // ============================================================
  // LOAD EMPLOYEE SKILL GAPS
  // ============================================================

  const loadSkillGaps = async (
    employeeIdentifier
  ) => {
    try {
      setLoadingGaps(true);
      setErrorMessage("");

      // --------------------------------------------------------
      // LOAD KNOWLEDGE GAPS
      // --------------------------------------------------------

      const gapResponse =
        await api.get(
          `/knowledge-gaps/employee/${employeeIdentifier}`,
          getHeaders()
        );

      const gapData =
        Array.isArray(
          gapResponse.data
        )
          ? gapResponse.data
          : gapResponse.data?.data ||
            [];

      // --------------------------------------------------------
      // LOAD CURRENT EMPLOYEE SKILLS
      // --------------------------------------------------------

      let employeeSkills = [];

      try {
        const skillResponse =
          await getEmployeeSkills(
            employeeIdentifier
          );

        employeeSkills =
          Array.isArray(
            skillResponse?.data
          )
            ? skillResponse.data
            : Array.isArray(
                skillResponse
              )
            ? skillResponse
            : [];
      } catch (skillError) {
        console.warn(
          "Unable to load employee skills:",
          skillError
        );
      }

      // ========================================================
      // CREATE EMPLOYEE SKILL MAP
      // ========================================================

      const employeeSkillMap =
        new Map();

      employeeSkills.forEach(
        (employeeSkill) => {
          const skillName =
            employeeSkill?.skill
              ?.skillName ||
            employeeSkill?.skillName;

          if (skillName) {
            employeeSkillMap.set(
              skillName
                .trim()
                .toLowerCase(),
              employeeSkill
            );
          }
        }
      );

      // ========================================================
      // REBUILD GAP DATA
      // USING CURRENT EMPLOYEE SKILLS
      // ========================================================

      const compatibleGaps =
        gapData.map((gap) => {
          const skillName =
            gap?.skill
              ?.skillName ||
            gap?.skillName ||
            gap?.name ||
            "Unknown Skill";

          const skillKey =
            skillName
              .trim()
              .toLowerCase();

          const employeeSkill =
            employeeSkillMap.get(
              skillKey
            );

          const currentLevel =
            employeeSkill
              ? Number(
                  employeeSkill.currentLevel
                ) || 0
              : Number(
                  gap?.currentLevel
                ) || 0;

          const requiredLevel =
            Number(
              gap?.requiredLevel
            ) || 0;

          const currentScore =
            levelToPercentage(
              currentLevel
            );

          const requiredScore = 70;

          const percentageGap =
            Math.max(
              requiredScore -
                currentScore,
              0
            );

          const status =
            getGapStatus(
              percentageGap
            );

          return {
            ...gap,
            skillName,
            currentLevel,
            requiredLevel,
            currentScore,
            requiredScore,
            gapPercentage:
              percentageGap,
            status,
          };
        });

      setSkillGaps(
        compatibleGaps
      );
    } catch (error) {
      console.error(
        "Error loading skill gaps:",
        error
      );

      setSkillGaps([]);

      setErrorMessage(
        error?.response?.data
          ?.message ||
          "Unable to load employee skill gaps."
      );
    } finally {
      setLoadingGaps(false);
    }
  };

  // ============================================================
  // SKILL GAP SELECT
  // ============================================================

  const handleSkillGapChange = async (
    e
  ) => {
    const skillGapId =
      e.target.value;

    setSelectedSkillGap(
      skillGapId
    );

    setSelectedMentor("");
    setRecommendedMentors([]);
    setSuccessMessage("");
    setErrorMessage("");

    if (!skillGapId) {
      return;
    }

    await loadRecommendedMentors(
      skillGapId
    );
  };

  // ============================================================
  // LOAD MENTORS
  // ============================================================

  const loadRecommendedMentors =
    async (skillGapId) => {
      try {
        setLoadingMentors(true);
        setErrorMessage("");

        // ------------------------------------------------------
        // GET ALL USERS
        // ------------------------------------------------------

        const response =
          await getEmployees();

        const data =
          Array.isArray(response)
            ? response
            : response?.data || [];

        // ======================================================
        // ONLY MENTOR ROLE
        // ======================================================

        const mentors =
          data.filter((user) => {
            const role =
              user.role ||
              user.userRole ||
              user.roleName ||
              user.authority ||
              user.authorities;

            if (Array.isArray(role)) {
              return role.some(
                (item) =>
                  normalizeRole(
                    item
                  ) === "MENTOR"
              );
            }

            return (
              normalizeRole(
                role
              ) === "MENTOR"
            );
          });

        // ======================================================
        // SELECTED SKILL GAP
        // ======================================================

        const selectedGap =
          skillGaps.find(
            (gap) =>
              String(
                gap.id
              ) ===
              String(
                skillGapId
              )
          );

        const skillId =
          selectedGap?.skillId ||
          selectedGap?.skill?.id ||
          selectedGap?.skill
            ?.skillId;

        const skillName =
          selectedGap?.skillName ||
          selectedGap?.skill
            ?.skillName ||
          selectedGap?.name;

        let matchedMentors =
          mentors;

        // ======================================================
        // MATCH MENTOR WITH SKILL
        // ======================================================

        if (
          skillId ||
          skillName
        ) {
          const skillMatched =
            mentors.filter(
              (mentor) =>
                mentorHasSkill(
                  mentor,
                  skillId,
                  skillName
                )
            );

          if (
            skillMatched.length >
            0
          ) {
            matchedMentors =
              skillMatched;
          }
        }

        setRecommendedMentors(
          matchedMentors
        );

        if (
          matchedMentors.length ===
          0
        ) {
          setErrorMessage(
            "No mentors are currently available."
          );
        }
      } catch (error) {
        console.error(
          "Error loading recommended mentors:",
          error
        );

        setRecommendedMentors([]);

        setErrorMessage(
          error?.response?.data
            ?.message ||
            "Unable to load recommended mentors."
        );
      } finally {
        setLoadingMentors(false);
      }
    };

  // ============================================================
  // CHECK MENTOR SKILL
  // ============================================================

  const mentorHasSkill = (
    mentor,
    skillId,
    skillName
  ) => {
    const skills =
      mentor?.skills ||
      mentor?.employeeSkills ||
      mentor?.mentorSkills ||
      [];

    if (!Array.isArray(skills)) {
      return false;
    }

    return skills.some(
      (item) => {
        const itemSkillId =
          item?.skillId ||
          item?.skill?.id;

        const itemSkillName =
          item?.skillName ||
          item?.skill?.skillName ||
          item?.name;

        if (
          skillId &&
          String(
            itemSkillId
          ) ===
            String(skillId)
        ) {
          return true;
        }

        if (
          skillName &&
          itemSkillName &&
          String(
            itemSkillName
          ).toLowerCase() ===
            String(
              skillName
            ).toLowerCase()
        ) {
          return true;
        }

        return false;
      }
    );
  };

  // ============================================================
  // SELECT MENTOR
  // ============================================================

  const handleMentorChange = (
    e
  ) => {
    setSelectedMentor(
      e.target.value
    );

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ============================================================
  // SELECTED OBJECTS
  // ============================================================

  const selectedEmployeeObject =
    employees.find(
      (employee) =>
        String(
          getEmployeeIdentifier(
            employee
          )
        ) ===
        String(
          selectedEmployee
        )
    );

  const selectedSkillGapObject =
    skillGaps.find(
      (gap) =>
        String(gap.id) ===
        String(
          selectedSkillGap
        )
    );

  const selectedMentorObject =
    recommendedMentors.find(
      (mentor) =>
        String(
          mentor.employeeId ||
            mentor.employeeCode ||
            mentor.id
        ) ===
        String(
          selectedMentor
        )
    );

  // ============================================================
  // RECOMMEND MENTOR
  // ============================================================

  const handleRecommendMentor =
    async () => {
      if (!selectedEmployee) {
        setErrorMessage(
          "Please select an employee."
        );
        return;
      }

      if (!selectedSkillGap) {
        setErrorMessage(
          "Please select a skill gap."
        );
        return;
      }

      if (!selectedMentor) {
        setErrorMessage(
          "Please select a mentor."
        );
        return;
      }

      try {
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        const skillGap =
          skillGaps.find(
            (gap) =>
              String(
                gap.id
              ) ===
              String(
                selectedSkillGap
              )
          );

        const skillId =
          skillGap?.skillId ||
          skillGap?.skill?.id ||
          skillGap?.skill
            ?.skillId;

        if (!skillId) {
          setErrorMessage(
            "Unable to determine the selected skill."
          );
          return;
        }

        const mentorIdentifier =
          selectedMentorObject
            ?.employeeId ||
          selectedMentorObject
            ?.mentorEmployeeId ||
          selectedMentorObject
            ?.employeeCode ||
          selectedMentorObject
            ?.username ||
          selectedMentorObject?.id;

        const recommendedByIdentifier =
          localStorage.getItem(
            "employeeId"
          ) ||
          localStorage.getItem(
            "username"
          ) ||
          null;

        // ======================================================
        // EXISTING ALLOCATION FUNCTIONALITY
        // ======================================================

        await allocateMentor({
          employeeIdentifier:
            selectedEmployee,

          mentorIdentifier:
            mentorIdentifier,

          skillId:
            skillId,

          recommendedByIdentifier:
            recommendedByIdentifier,
        });

        setSuccessMessage(
          "Mentor recommended successfully. The recommendation is now available to the respective employee."
        );
      } catch (error) {
        console.error(
          "Error recommending mentor:",
          error
        );

        setErrorMessage(
          error?.response?.data
            ?.message ||
            "Failed to recommend mentor."
        );
      } finally {
        setSaving(false);
      }
    };

  // ============================================================
  // DISPLAY HELPERS
  // ============================================================

  const getEmployeeName = (
    employee
  ) => {
    if (!employee) {
      return "";
    }

    if (
      employee.firstName ||
      employee.lastName
    ) {
      return `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim();
    }

    return (
      employee.name ||
      employee.fullName ||
      employee.username ||
      employee.employeeName ||
      "Employee"
    );
  };

  const getEmployeeCode = (
    employee
  ) => {
    return (
      employee.employeeId ||
      employee.employeeCode ||
      employee.username ||
      employee.id
    );
  };

  const getMentorName = (
    mentor
  ) => {
    if (!mentor) {
      return "";
    }

    if (
      mentor.firstName ||
      mentor.lastName
    ) {
      return `${mentor.firstName || ""} ${
        mentor.lastName || ""
      }`.trim();
    }

    return (
      mentor.mentorName ||
      mentor.name ||
      mentor.fullName ||
      mentor.username ||
      "Mentor"
    );
  };

  const getMentorCode = (
    mentor
  ) => {
    return (
      mentor.employeeId ||
      mentor.mentorEmployeeId ||
      mentor.employeeCode ||
      mentor.username ||
      mentor.id
    );
  };

  const getSkillName = (gap) => {
    return (
      gap?.skillName ||
      gap?.skill?.skillName ||
      gap?.name ||
      "Skill"
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ======================================================
          HR SIDEBAR
      ====================================================== */}

      <Sidebar role="HR" />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">

        <Navbar title="Mentor Allocation" />

        <main className="p-5 md:p-8">

          <div className="max-w-7xl mx-auto">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">

              <div className="mb-8">

                <div className="flex items-center gap-3">

                  <UserCheck
                    size={32}
                    className="text-blue-600"
                  />

                  <h1 className="text-3xl font-bold text-slate-900">
                    Recommend a Mentor
                  </h1>

                </div>

                <p className="text-slate-600 mt-2">
                  Select an employee to identify
                  their skill gaps and suitable
                  mentors.
                </p>

              </div>

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

                  <CheckCircle size={20} />

                  <span>
                    {successMessage}
                  </span>

                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {errorMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

                  <AlertCircle size={20} />

                  <span>
                    {errorMessage}
                  </span>

                </div>
              )}

              {/* ==================================================
                  SELECTION ROW
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ==================================================
                    EMPLOYEE
                ================================================== */}

                <div>

                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Employee
                  </label>

                  <select
                    value={
                      selectedEmployee
                    }
                    onChange={
                      handleEmployeeChange
                    }
                    disabled={
                      loadingEmployees
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >

                    <option value="">
                      {loadingEmployees
                        ? "Loading employees..."
                        : "Select Employee"}
                    </option>

                    {employees.map(
                      (employee) => (
                        <option
                          key={
                            employee.id
                          }
                          value={getEmployeeIdentifier(
                            employee
                          )}
                        >
                          {getEmployeeCode(
                            employee
                          )}{" "}
                          -{" "}
                          {getEmployeeName(
                            employee
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ==================================================
                    SKILL GAP
                ================================================== */}

                <div>

                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Skill Gap
                  </label>

                  <select
                    value={
                      selectedSkillGap
                    }
                    onChange={
                      handleSkillGapChange
                    }
                    disabled={
                      !selectedEmployee ||
                      loadingGaps
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >

                    <option value="">
                      {loadingGaps
                        ? "Loading skill gaps..."
                        : "Select Skill Gap"}
                    </option>

                    {skillGaps.map(
                      (gap) => (
                        <option
                          key={gap.id}
                          value={gap.id}
                        >
                          {getSkillName(
                            gap
                          )}{" "}
                          -{" "}
                          {getSkillGapStatus(
                            gap
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ==================================================
                    MENTOR
                ================================================== */}

                <div>

                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Recommended Mentor
                  </label>

                  <select
                    value={
                      selectedMentor
                    }
                    onChange={
                      handleMentorChange
                    }
                    disabled={
                      !selectedSkillGap ||
                      loadingMentors
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >

                    <option value="">
                      {loadingMentors
                        ? "Finding mentors..."
                        : "Select Mentor"}
                    </option>

                    {recommendedMentors.map(
                      (mentor) => (
                        <option
                          key={
                            mentor.id
                          }
                          value={
                            mentor.employeeId ||
                            mentor.employeeCode ||
                            mentor.id
                          }
                        >
                          {getMentorCode(
                            mentor
                          )}{" "}
                          -{" "}
                          {getMentorName(
                            mentor
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* ==================================================
                  MENTOR DETAILS
              ================================================== */}

              {selectedMentorObject && (
                <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">

                  <h2 className="text-xl font-semibold text-blue-900 mb-6">
                    Mentor Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* MENTOR */}

                    <div>

                      <p className="text-sm text-slate-500 mb-1">
                        Mentor
                      </p>

                      <p className="text-lg font-semibold text-slate-900">
                        {getMentorName(
                          selectedMentorObject
                        )}
                      </p>

                    </div>

                    {/* EMPLOYEE ID */}

                    <div>

                      <p className="text-sm text-slate-500 mb-1">
                        Employee ID
                      </p>

                      <p className="text-lg font-semibold text-slate-900">
                        {getMentorCode(
                          selectedMentorObject
                        )}
                      </p>

                    </div>

                    {/* SKILL */}

                    <div>

                      <p className="text-sm text-slate-500 mb-1">
                        Skill
                      </p>

                      <p className="text-lg font-semibold text-slate-900">
                        {getSkillName(
                          selectedSkillGapObject
                        )}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* ==================================================
                  BUTTON
              ================================================== */}

              <div className="flex justify-end mt-8">

                <button
                  onClick={
                    handleRecommendMentor
                  }
                  disabled={
                    saving ||
                    !selectedEmployee ||
                    !selectedSkillGap ||
                    !selectedMentor
                  }
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <UserCheck size={20} />

                  {saving
                    ? "Recommending..."
                    : "Recommend Mentor"}

                </button>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default MentorAllocation;