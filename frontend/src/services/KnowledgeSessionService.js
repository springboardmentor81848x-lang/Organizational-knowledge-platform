import api from "../services/api";

// =====================================================
// KNOWLEDGE SESSION APIs
// =====================================================

// Get all available sessions
export const getAvailableSessions = async () => {
  const response = await api.get(
    "/knowledge-sessions/available"
  );
  return response.data;
};

// Get all sessions
export const getAllSessions = async () => {
  const response = await api.get(
    "/knowledge-sessions"
  );
  return response.data;
};

// Get sessions created by mentor
// mentorId = database Employee.id
// Example: 43
export const getMentorSessions = async (mentorId) => {
  const response = await api.get(
    `/knowledge-sessions/mentor/${mentorId}`
  );
  return response.data;
};

// Get one session
export const getSessionById = async (sessionId) => {
  const response = await api.get(
    `/knowledge-sessions/${sessionId}`
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
  const response = await api.post(
    `/knowledge-sessions/mentor/${mentorId}`,
    sessionData
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
  const response = await api.put(
    `/knowledge-sessions/${sessionId}/mentor/${mentorId}`,
    sessionData
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
  const response = await api.put(
    `/knowledge-sessions/${sessionId}/mentor/${mentorId}/cancel`,
    {}
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
  const response = await api.put(
    `/knowledge-sessions/${sessionId}/mentor/${mentorId}/complete`,
    {}
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
  const response = await api.post(
    `/session-registrations/session/${sessionId}/employee/${employeeId}`,
    {}
  );
  return response.data;
};

// Cancel employee registration
export const cancelRegistration = async (
  sessionId,
  employeeId
) => {
  const response = await api.put(
    `/session-registrations/session/${sessionId}/employee/${employeeId}/cancel`,
    {}
  );
  return response.data;
};

// Get employee registrations
export const getEmployeeRegistrations = async (
  employeeId
) => {
  const response = await api.get(
    `/session-registrations/employee/${employeeId}`
  );
  return response.data;
};

// Get registrations for a session
export const getSessionRegistrations = async (
  sessionId
) => {
  const response = await api.get(
    `/session-registrations/session/${sessionId}`
  );
  return response.data;
};

// Mark attendance
export const markAttendance = async (
  registrationId,
  attended
) => {
  const response = await api.put(
    `/session-registrations/${registrationId}/attendance?attended=${attended}`,
    {}
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
  const response = await api.post(
    `/session-feedback/session/${sessionId}/employee/${employeeId}`,
    null,
    {
      params: {
        rating,
        comments,
      },
    }
  );

  return response.data;
};

// Get feedback for a session
export const getSessionFeedback = async (
  sessionId
) => {
  const response = await api.get(
    `/session-feedback/session/${sessionId}`
  );
  return response.data;
};

// Get feedback submitted by employee
export const getEmployeeFeedback = async (
  employeeId
) => {
  const response = await api.get(
    `/session-feedback/employee/${employeeId}`
  );
  return response.data;
};

// Get session effectiveness
export const getSessionEffectiveness = async (
  sessionId
) => {
  const response = await api.get(
    `/session-feedback/session/${sessionId}/effectiveness`
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
  const response = await api.get(
    `/learning-analytics/mentor/${mentorId}`
  );
  return response.data;
};

// Get effectiveness from Learning Analytics
export const getLearningSessionEffectiveness = async (
  sessionId
) => {
  const response = await api.get(
    `/learning-analytics/session/${sessionId}/effectiveness`
  );
  return response.data;
};