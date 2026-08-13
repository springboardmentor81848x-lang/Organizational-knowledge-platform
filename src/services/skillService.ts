import API from "@/api/axios";

export const skillService = {
  // Fetch available master skills for dropdown selection
  getMasterSkills: async () => {
    const response = await API.get("/api/master/skills");
    return response.data; // Returns array of SkillMasterResponseDTO
  },

  // Get logged-in employee's added skills
  getMySkills: async () => {
    const response = await API.get("/api/skills");
    return response.data; // Returns array of SkillResponseDTO
  },

  // Add skill using skillId from master list
  addEmployeeSkill: async (skillData: { skillId: number; proficiencyLevel: string; yearsOfExperience: number; lastUsed: string }) => {
    const response = await API.post("/api/skills", skillData);
    return response.data;
  },

  // Update employee skill using employeeSkillId
  updateEmployeeSkill: async (employeeSkillId: number, skillData: any) => {
    const response = await API.put(`/api/skills/${employeeSkillId}`, skillData);
    return response.data;
  },

  // Delete employee skill using employeeSkillId
  deleteEmployeeSkill: async (employeeSkillId: number) => {
    const response = await API.delete(`/api/skills/${employeeSkillId}`);
    return response.data;
  }
};