import api from "./api";

// ============================================================
// TYPES
// ============================================================

export interface MentorRecommendation {
  employeeId: number;
  employeeCode?: string;
  name: string;
  department?: string;
  role?: string;
  skillId: number;
  skillName: string;
  proficiency: string;
  yearsOfExperience: number;
  gapPercentage?: number;
}

export interface MentorshipRequest {
  requestId: number;
  menteeId: number;
  menteeName: string;
  mentorId: number;
  mentorName: string;
  skillId: number;
  skillName: string;
  message?: string;
  status: string;
  createdAt?: string;
}

export interface KnowledgeSession {
  sessionId: number;
  requestId: number;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  notes?: string;
  mentorId: number;
  mentorName: string;
  menteeId: number;
  menteeName: string;
  skillId: number;
  skillName: string;
}

// ============================================================
// MENTOR RECOMMENDATIONS
// ============================================================

const getRecommendations = async (): Promise<MentorRecommendation[]> => {
  const response = await api.get<MentorRecommendation[]>(
    "/mentorship/recommendations"
  );

  return response.data;
};

// ============================================================
// MENTORSHIP REQUESTS
// ============================================================

const getRequests = async (): Promise<MentorshipRequest[]> => {
  const response = await api.get<MentorshipRequest[]>(
    "/mentorship/requests"
  );

  return response.data;
};

const createRequest = async (
  mentorId: number,
  skillId: number,
  message?: string
): Promise<MentorshipRequest> => {
  const response = await api.post<MentorshipRequest>(
    "/mentorship/requests",
    {
      mentorId,
      skillId,
      message,
    }
  );

  return response.data;
};

const acceptRequest = async (
  requestId: number
): Promise<MentorshipRequest> => {
  const response = await api.post<MentorshipRequest>(
    `/mentorship/requests/${requestId}/accept`
  );

  return response.data;
};

const rejectRequest = async (
  requestId: number
): Promise<MentorshipRequest> => {
  const response = await api.post<MentorshipRequest>(
    `/mentorship/requests/${requestId}/reject`
  );

  return response.data;
};

// ============================================================
// KNOWLEDGE SESSIONS
// ============================================================

const getSessions = async (): Promise<KnowledgeSession[]> => {
  const response = await api.get<KnowledgeSession[]>(
    "/mentorship/sessions"
  );

  return response.data;
};

const createSession = async (
  requestId: number,
  title: string,
  scheduledAt: string,
  durationMinutes: number,
  notes?: string
): Promise<KnowledgeSession> => {
  const response = await api.post<KnowledgeSession>(
    `/mentorship/requests/${requestId}/sessions`,
    {
      title,
      scheduledAt,
      durationMinutes,
      notes,
    }
  );

  return response.data;
};

const completeSession = async (
  sessionId: number
): Promise<KnowledgeSession> => {
  const response = await api.post<KnowledgeSession>(
    `/mentorship/sessions/${sessionId}/complete`
  );

  return response.data;
};

// ============================================================
// SESSION FEEDBACK
// ============================================================

const submitFeedback = async (
  sessionId: number,
  rating: number,
  comments?: string
): Promise<void> => {
  await api.post(
    `/mentorship/sessions/${sessionId}/feedback`,
    {
      rating,
      comments,
    }
  );
};

// ============================================================
// SERVICE
// ============================================================

const mentorshipService = {
  getRecommendations,
  getRequests,
  createRequest,
  acceptRequest,
  rejectRequest,
  getSessions,
  createSession,
  completeSession,
  submitFeedback,
};

export default mentorshipService;