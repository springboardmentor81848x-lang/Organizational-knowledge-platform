import API from "@/api/axios";

export type ProficiencyLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export interface SkillMaster {
  skillId: number;
  skillName: string;
  skillCategory: string;
  description?: string;
}

export interface EmployeeSkill {
  employeeSkillId: number;
  skillId: number;
  employeeCode?: string;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience: number;
  lastUsed?: string;
}

export interface SkillRequest {
  skillId: number;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience: number;
  lastUsed?: string;
}

// Get all skills available in Skill Master
export const getSkillMaster = async (): Promise<SkillMaster[]> => {
  const response = await API.get<SkillMaster[]>("/master/skills");
  return response.data;
};

// Get skills belonging to logged-in employee
export const getMySkills = async (): Promise<EmployeeSkill[]> => {
  const response = await API.get<EmployeeSkill[]>("/skills");
  return response.data;
};

// Add skill for logged-in employee
export const addSkill = async (
  data: SkillRequest
): Promise<EmployeeSkill> => {
  const response = await API.post<EmployeeSkill>("/skills", data);
  return response.data;
};

// Update employee skill
export const updateSkill = async (
  employeeSkillId: number,
  data: SkillRequest
): Promise<EmployeeSkill> => {
  const response = await API.put<EmployeeSkill>(
    `/skills/${employeeSkillId}`,
    data
  );

  return response.data;
};

// Delete employee skill
export const deleteSkill = async (
  employeeSkillId: number
): Promise<string> => {
  const response = await API.delete<string>(
    `/skills/${employeeSkillId}`
  );

  return response.data;
};