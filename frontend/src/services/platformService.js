import api from "./api";

// =========================================================
// KNOWLEDGE GAP
// =========================================================

export const detectGaps = async (employeeIdentifier) => {
  return await api.post(
    `/gaps/detect/${encodeURIComponent(employeeIdentifier)}`
  );
};

export const getKnowledgeGapsByEmployee = async (
  employeeIdentifier
) => {
  return await api.get(
    `/gaps/employee/${encodeURIComponent(employeeIdentifier)}`
  );
};

export const getTargetRole = async (
  employeeIdentifier
) => {
  return await api.get(
    `/gaps/employee/${encodeURIComponent(employeeIdentifier)}/target-role`
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
    `/competencies/designation/${encodeURIComponent(designation)}`
  );
};


// =========================================================
// EMPLOYEE SKILLS
// =========================================================

export const getEmployeeSkills = async (
  employeeId
) => {
  return await api.get(
    `/employee-skills/employee/${encodeURIComponent(employeeId)}`
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


// =========================================================
// ASK AI
// =========================================================

export const askAIQuestion = async (
  question,
  learningPath
) => {
  return await api.post("/ai/ask", {
    question,
    learningPath,
  });
};