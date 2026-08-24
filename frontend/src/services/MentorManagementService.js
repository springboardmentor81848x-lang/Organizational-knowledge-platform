import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// =========================================================
// MENTOR PROFILE
// Backend:
// GET /api/mentor-management/profile/{employeeIdentifier}
// employeeIdentifier can be EMP/MEN ID such as MEN001
// =========================================================

export const getMentorProfile = async (employeeIdentifier) => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/profile/${employeeIdentifier}`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching mentor profile:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// MENTOR DIRECTORY
// Backend:
// GET /api/mentor-management/mentors
// =========================================================

export const getAllMentors = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/mentors`,
      getAuthConfig()
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Error fetching mentors:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// MENTOR EXPERTISE
// Backend:
// GET /api/mentor-management/mentors/{employeeIdentifier}/expertise
// =========================================================

export const getMentorExpertise = async (employeeIdentifier) => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/mentors/${employeeIdentifier}/expertise`,
      getAuthConfig()
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Error fetching mentor expertise:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// DASHBOARD SUMMARY
// Backend:
// GET /api/mentor-management/summary
// =========================================================

export const getMentorManagementSummary = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/summary`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching mentor management summary:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// MENTORSHIP REQUESTS
// Backend:
// GET /api/mentor-management/requests
// =========================================================

export const getMentorshipRequests = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/requests`,
      getAuthConfig()
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Error fetching mentorship requests:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// ACTIVE MENTORSHIPS
// Backend:
// GET /api/mentor-management/active
// =========================================================

export const getActiveMentorships = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/active`,
      getAuthConfig()
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Error fetching active mentorships:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// MENTORSHIP HISTORY
// Backend:
// GET /api/mentor-management/history
// =========================================================

export const getMentorshipHistory = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/mentor-management/history`,
      getAuthConfig()
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Error fetching mentorship history:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// ACCEPT MENTORSHIP REQUEST
// Backend:
// PUT /api/mentor-management/requests/{id}/accept
// =========================================================

export const acceptMentorship = async (mentorshipId) => {
  try {
    const response = await axios.put(
      `${API_URL}/mentor-management/requests/${mentorshipId}/accept`,
      {},
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error accepting mentorship:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// REJECT MENTORSHIP REQUEST
// Backend:
// PUT /api/mentor-management/requests/{id}/reject
// =========================================================

export const rejectMentorship = async (mentorshipId) => {
  try {
    const response = await axios.put(
      `${API_URL}/mentor-management/requests/${mentorshipId}/reject`,
      {},
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error rejecting mentorship:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// ACTIVATE MENTORSHIP
// Backend:
// PUT /api/mentor-management/mentorships/{id}/activate
// =========================================================

export const activateMentorship = async (mentorshipId) => {
  try {
    const response = await axios.put(
      `${API_URL}/mentor-management/mentorships/${mentorshipId}/activate`,
      {},
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error activating mentorship:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// COMPLETE MENTORSHIP
// Backend:
// PUT /api/mentor-management/mentorships/{id}/complete
// =========================================================

export const completeMentorship = async (mentorshipId) => {
  try {
    const response = await axios.put(
      `${API_URL}/mentor-management/mentorships/${mentorshipId}/complete`,
      {},
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error completing mentorship:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {
  getMentorProfile,
  getAllMentors,
  getMentorExpertise,
  getMentorManagementSummary,
  getMentorshipRequests,
  getActiveMentorships,
  getMentorshipHistory,
  acceptMentorship,
  rejectMentorship,
  activateMentorship,
  completeMentorship,
};