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

// Get employee skills
export const getEmployeeSkills = async () => {
  return await api.get("/employee-skills");
};