import api from "../services/api";

// =========================================================
// MENTOR PROFILE
// Backend:
// GET /api/mentor-management/profile/{employeeIdentifier}
// employeeIdentifier can be EMP/MEN ID such as MEN001
// =========================================================

export const getMentorProfile = async (employeeIdentifier) => {
  try {
    const response = await api.get(
      `/mentor-management/profile/${employeeIdentifier}`
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
    const response = await api.get(
      "/mentor-management/mentors"
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
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

export const getMentorExpertise = async (
  employeeIdentifier
) => {
  try {
    const response = await api.get(
      `/mentor-management/mentors/${employeeIdentifier}/expertise`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
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
    const response = await api.get(
      "/mentor-management/summary"
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
    const response = await api.get(
      "/mentor-management/requests"
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
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
    const response = await api.get(
      "/mentor-management/active"
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
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
    const response = await api.get(
      "/mentor-management/history"
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
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

export const acceptMentorship = async (
  mentorshipId
) => {
  try {
    const response = await api.put(
      `/mentor-management/requests/${mentorshipId}/accept`,
      {}
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

export const rejectMentorship = async (
  mentorshipId
) => {
  try {
    const response = await api.put(
      `/mentor-management/requests/${mentorshipId}/reject`,
      {}
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

export const activateMentorship = async (
  mentorshipId
) => {
  try {
    const response = await api.put(
      `/mentor-management/mentorships/${mentorshipId}/activate`,
      {}
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

export const completeMentorship = async (
  mentorshipId
) => {
  try {
    const response = await api.put(
      `/mentor-management/mentorships/${mentorshipId}/complete`,
      {}
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