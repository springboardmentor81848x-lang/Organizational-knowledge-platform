import api from "./api";


// Run gap detection
export const detectGaps = async (employeeIdentifier) => {
  return await api.post(`/knowledge-gaps/detect/${employeeIdentifier}`);
};

// Get gaps for an employee
export const getGapsByEmployee = async (employeeIdentifier) => {
  return await api.get(`/knowledge-gaps/employee/${employeeIdentifier}`);
};

// Get all competencies
export const getCompetencies = async () => {
  return await api.get("/competencies");
};

// Get competencies by designation
export const getCompetenciesByDesignation = async (designation) => {
  return await api.get(`/competencies/designation/${designation}`);
};

// Get employee skills
export const getEmployeeSkills = async (employeeId) => {
  return await api.get(
    `/employee-skills/employee/${employeeId}`
  );
};
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
export const askAIQuestion = async (question, learningPath) => {
  return await api.post("/ai/ask", {
    question: question,
    learningPath: learningPath,
  });
};