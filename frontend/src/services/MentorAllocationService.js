import api from "../services/api";

// ============================================================
// GET ALL EMPLOYEES / USERS
// ============================================================

export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

// ============================================================
// HR - ALLOCATE / RECOMMEND MENTOR
// ============================================================

export const allocateMentor = async ({
  employeeIdentifier,
  mentorIdentifier,
  skillId,
  recommendedByIdentifier,
  reason,
}) => {
  const params = new URLSearchParams();

  params.append(
    "employeeIdentifier",
    employeeIdentifier
  );

  params.append(
    "mentorIdentifier",
    mentorIdentifier
  );

  params.append(
    "skillId",
    String(skillId)
  );

  if (recommendedByIdentifier) {
    params.append(
      "recommendedByIdentifier",
      recommendedByIdentifier
    );
  }

  if (reason) {
    params.append(
      "reason",
      reason
    );
  }

  const response = await api.post(
    `/mentor-allocations?${params.toString()}`,
    null
  );

  return response.data;
};

// ============================================================
// HR - GET ALL ALLOCATIONS
// ============================================================

export const getAllMentorAllocations = async () => {
  const response = await api.get(
    "/mentor-allocations"
  );

  return response.data;
};

// ============================================================
// EMPLOYEE - GET RECOMMENDED MENTORS
// ============================================================

export const getEmployeeMentorRecommendations = async (
  employeeIdentifier
) => {
  const response = await api.get(
    `/mentor-allocations/employee/${employeeIdentifier}`
  );

  return response.data;
};

// ============================================================
// EMPLOYEE - GET ALL ALLOCATIONS
// ============================================================

export const getEmployeeMentorAllocations = async (
  employeeIdentifier
) => {
  const response = await api.get(
    `/mentor-allocations/employee/${employeeIdentifier}/all`
  );

  return response.data;
};

// ============================================================
// MENTOR - GET THEIR ALLOCATIONS
// ============================================================

export const getMentorAllocations = async (
  mentorIdentifier
) => {
  const response = await api.get(
    `/mentor-allocations/mentor/${mentorIdentifier}`
  );

  return response.data;
};