import api from "./api";

// =========================================================
// KNOWLEDGE GAP
// =========================================================

// ---------------------------------------------------------
// Detect and SAVE knowledge gaps
// Use this when assessment/gap analysis needs to generate
// new gaps.
// ---------------------------------------------------------
export const detectGaps = async (employeeIdentifier) => {
  return await api.post(
    `/knowledge-gaps/detect/${employeeIdentifier}`
  );
};


// ---------------------------------------------------------
// Get ALREADY STORED knowledge gaps for employee
//
// IMPORTANT:
// Employee Dashboard should use this API.
// It should NOT call detectGaps() every time the dashboard
// loads.
// ---------------------------------------------------------
export const getKnowledgeGapsByEmployee = async (
  employeeIdentifier
) => {
  return await api.get(
    `/knowledge-gaps/employee/${employeeIdentifier}`
  );
};


// ---------------------------------------------------------
// Get target role from latest assessment
// ---------------------------------------------------------
export const getTargetRole = async (
  employeeIdentifier
) => {
  return await api.get(
    `/knowledge-gaps/employee/${employeeIdentifier}/target-role`
  );
};


// =========================================================
// COMPETENCIES
// =========================================================

export const getCompetencies = async () => {
  return await api.get("/competencies");
};

export const getCompetenciesByDesignation = async (
  designation
) => {
  return await api.get(
    `/competencies/designation/${encodeURIComponent(
      designation
    )}`
  );
};


// =========================================================
// EMPLOYEE SKILLS
// =========================================================

// Get current skill inventory of employee
export const getEmployeeSkills = async (
  employeeId
) => {
  return await api.get(
    `/employee-skills/employee/${employeeId}`
  );
};


// =========================================================
// AI LEARNING PATH
// =========================================================

export const getAIRecommendation = (
  role,
  currentSkills,
  missingSkills,
  score
) => {
  return api.get("/ai/recommendation", {
    params: {
      role,
      currentSkills: currentSkills.join(","),
      missingSkills: missingSkills.join(","),
      score,
    },
  });
};


// Ask AI using generated learning path
export const askAIQuestion = async (
  question,
  learningPath
) => {
  return await api.post("/ai/ask", {
    question,
    learningPath,
  });
};