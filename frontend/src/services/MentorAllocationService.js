import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// ============================================================
// GET ALL EMPLOYEES / USERS
// ============================================================

export const getEmployees = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/employees`,
    getHeaders()
  );

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

  const response = await axios.post(
    `${API_BASE_URL}/mentor-allocations?${params.toString()}`,
    null,
    getHeaders()
  );

  return response.data;
};

// ============================================================
// HR - GET ALL ALLOCATIONS
// ============================================================

export const getAllMentorAllocations = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/mentor-allocations`,
    getHeaders()
  );

  return response.data;
};

// ============================================================
// EMPLOYEE - GET RECOMMENDED MENTORS
// ============================================================

export const getEmployeeMentorRecommendations = async (
  employeeIdentifier
) => {
  const response = await axios.get(
    `${API_BASE_URL}/mentor-allocations/employee/${employeeIdentifier}`,
    getHeaders()
  );

  return response.data;
};

// ============================================================
// EMPLOYEE - GET ALL ALLOCATIONS
// ============================================================

export const getEmployeeMentorAllocations = async (
  employeeIdentifier
) => {
  const response = await axios.get(
    `${API_BASE_URL}/mentor-allocations/employee/${employeeIdentifier}/all`,
    getHeaders()
  );

  return response.data;
};

// ============================================================
// MENTOR - GET THEIR ALLOCATIONS
// ============================================================

export const getMentorAllocations = async (
  mentorIdentifier
) => {
  const response = await axios.get(
    `${API_BASE_URL}/mentor-allocations/mentor/${mentorIdentifier}`,
    getHeaders()
  );

  return response.data;
};