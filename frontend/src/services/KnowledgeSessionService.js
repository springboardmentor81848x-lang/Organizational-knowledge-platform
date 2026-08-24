import axios from "axios";

const API_URL = "http://localhost:8080/api";

// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// =====================================================
// KNOWLEDGE SESSION APIs
// =====================================================

// Get all available sessions
export const getAvailableSessions = async () => {
  const response = await axios.get(
    `${API_URL}/knowledge-sessions/available`,
    getAuthHeaders()
  );

  return response.data;
};

// Get all sessions
export const getAllSessions = async () => {
  const response = await axios.get(
    `${API_URL}/knowledge-sessions`,
    getAuthHeaders()
  );

  return response.data;
};

// Get sessions created by mentor
// mentorId = database Employee.id
// Example: 43
export const getMentorSessions = async (mentorId) => {
  const response = await axios.get(
    `${API_URL}/knowledge-sessions/mentor/${mentorId}`,
    getAuthHeaders()
  );

  return response.data;
};

// Get one session
export const getSessionById = async (sessionId) => {
  const response = await axios.get(
    `${API_URL}/knowledge-sessions/${sessionId}`,
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// CREATE SESSION
// =====================================================

export const createSession = async (
  mentorId,
  sessionData
) => {
  const response = await axios.post(
    `${API_URL}/knowledge-sessions/mentor/${mentorId}`,
    sessionData,
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// UPDATE SESSION
// =====================================================
// mentorId = database Employee.id

export const updateSession = async (
  sessionId,
  mentorId,
  sessionData
) => {
  const response = await axios.put(
    `${API_URL}/knowledge-sessions/${sessionId}/mentor/${mentorId}`,
    sessionData,
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// CANCEL SESSION
// =====================================================
// mentorId = database Employee.id

export const cancelSession = async (
  sessionId,
  mentorId
) => {
  const response = await axios.put(
    `${API_URL}/knowledge-sessions/${sessionId}/mentor/${mentorId}/cancel`,
    {},
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// COMPLETE SESSION
// =====================================================
// mentorId = database Employee.id

export const completeSession = async (
  sessionId,
  mentorId
) => {
  const response = await axios.put(
    `${API_URL}/knowledge-sessions/${sessionId}/mentor/${mentorId}/complete`,
    {},
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// SESSION REGISTRATION APIs
// =====================================================

// Register employee for session
// employeeId = business employee identifier
// Example: EMP1002

export const registerForSession = async (
  sessionId,
  employeeId
) => {
  const response = await axios.post(
    `${API_URL}/session-registrations/session/${sessionId}/employee/${employeeId}`,
    {},
    getAuthHeaders()
  );

  return response.data;
};

// Cancel employee registration

export const cancelRegistration = async (
  sessionId,
  employeeId
) => {
  const response = await axios.put(
    `${API_URL}/session-registrations/session/${sessionId}/employee/${employeeId}/cancel`,
    {},
    getAuthHeaders()
  );

  return response.data;
};

// Get employee registrations

export const getEmployeeRegistrations = async (
  employeeId
) => {
  const response = await axios.get(
    `${API_URL}/session-registrations/employee/${employeeId}`,
    getAuthHeaders()
  );

  return response.data;
};

// Get registrations for a session

export const getSessionRegistrations = async (
  sessionId
) => {
  const response = await axios.get(
    `${API_URL}/session-registrations/session/${sessionId}`,
    getAuthHeaders()
  );

  return response.data;
};

// Mark attendance

export const markAttendance = async (
  registrationId,
  attended
) => {
  const response = await axios.put(
    `${API_URL}/session-registrations/${registrationId}/attendance?attended=${attended}`,
    {},
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// SESSION FEEDBACK APIs
// =====================================================

export const submitFeedback = async (
  sessionId,
  employeeId,
  rating,
  comments
) => {
  const response = await axios.post(
    `${API_URL}/session-feedback/session/${sessionId}/employee/${employeeId}`,
    null,
    {
      ...getAuthHeaders(),
      params: {
        rating: rating,
        comments: comments,
      },
    }
  );

  return response.data;
};

// Get feedback for a session

export const getSessionFeedback = async (
  sessionId
) => {
  const response = await axios.get(
    `${API_URL}/session-feedback/session/${sessionId}`,
    getAuthHeaders()
  );

  return response.data;
};

// Get feedback submitted by employee

export const getEmployeeFeedback = async (
  employeeId
) => {
  const response = await axios.get(
    `${API_URL}/session-feedback/employee/${employeeId}`,
    getAuthHeaders()
  );

  return response.data;
};

// Get session effectiveness

export const getSessionEffectiveness = async (
  sessionId
) => {
  const response = await axios.get(
    `${API_URL}/session-feedback/session/${sessionId}/effectiveness`,
    getAuthHeaders()
  );

  return response.data;
};

// =====================================================
// LEARNING ANALYTICS APIs
// =====================================================

// Get mentor learning analytics

export const getMentorAnalytics = async (
  mentorId
) => {
  const response = await axios.get(
    `${API_URL}/learning-analytics/mentor/${mentorId}`,
    getAuthHeaders()
  );

  return response.data;
};

// Get effectiveness from Learning Analytics

export const getLearningSessionEffectiveness = async (
  sessionId
) => {
  const response = await axios.get(
    `${API_URL}/learning-analytics/session/${sessionId}/effectiveness`,
    getAuthHeaders()
  );

  return response.data;
};