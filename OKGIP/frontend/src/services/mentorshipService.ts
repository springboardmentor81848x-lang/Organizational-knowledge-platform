import api from "@/api/axios";

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
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | string;
  createdAt?: string;
}

export interface KnowledgeSession {
  sessionId: number;
  requestId: number;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | string;
  notes?: string;
  mentorId: number;
  mentorName: string;
  menteeId: number;
  menteeName: string;
  skillId: number;
  skillName: string;
  myFeedbackSubmitted?: boolean;
  averageRating?: number | null;
  feedbackCount?: number;
}

export interface KnowledgeResource {
  resourceId: number;
  sessionId: number;
  title: string;
  description?: string;
  resourceType: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  url?: string;
  authorId?: number;
  authorName?: string;
  createdAt?: string;
}

const mentorshipService = {
  async getRecommendations(): Promise<MentorRecommendation[]> {
    return (await api.get<MentorRecommendation[]>("/mentorship/recommendations")).data;
  },

  async getRequests(): Promise<MentorshipRequest[]> {
    return (await api.get<MentorshipRequest[]>("/mentorship/requests")).data;
  },

  async createRequest(mentorId: number, skillId: number, message?: string) {
    return (await api.post<MentorshipRequest>("/mentorship/requests", { mentorId, skillId, message })).data;
  },

  async acceptRequest(requestId: number) {
    return (await api.post<MentorshipRequest>(`/mentorship/requests/${requestId}/accept`)).data;
  },

  async rejectRequest(requestId: number) {
    return (await api.post<MentorshipRequest>(`/mentorship/requests/${requestId}/reject`)).data;
  },

  async getSessions(): Promise<KnowledgeSession[]> {
    return (await api.get<KnowledgeSession[]>("/mentorship/sessions")).data;
  },

  async getMentees(): Promise<MentorshipRequest[]> {
  const response = await api.get<MentorshipRequest[]>("/mentorship/mentees");
  return response.data;
},

async getMentorRequests(): Promise<MentorshipRequest[]> {
  const response = await api.get<MentorshipRequest[]>("/mentorship/mentor-requests");
  return response.data;
},

  async createSession(
    requestId: number,
    title: string,
    scheduledAt: string,
    durationMinutes: number,
    notes?: string,
  ) {
    return (await api.post<KnowledgeSession>(`/mentorship/requests/${requestId}/sessions`, {
      title, scheduledAt, durationMinutes, notes,
    })).data;
  },

  async completeSession(sessionId: number) {
    return (await api.post<KnowledgeSession>(`/mentorship/sessions/${sessionId}/complete`)).data;
  },

  async cancelSession(sessionId: number) {
    return (await api.post<KnowledgeSession>(`/mentorship/sessions/${sessionId}/cancel`)).data;
  },

  async submitFeedback(sessionId: number, rating: number, comments?: string) {
    await api.post(`/mentorship/sessions/${sessionId}/feedback`, { rating, comments });
  },

  async getResources(sessionId: number): Promise<KnowledgeResource[]> {
    return (await api.get<KnowledgeResource[]>(`/mentorship/sessions/${sessionId}/resources`)).data;
  },

  async uploadResource(
    sessionId: number,
    file: File,
    title?: string,
    description?: string,
  ): Promise<KnowledgeResource> {
    const formData = new FormData();
    formData.append("file", file);
    if (title?.trim()) formData.append("title", title.trim());
    if (description?.trim()) formData.append("description", description.trim());

    return (await api.post<KnowledgeResource>(
      `/mentorship/sessions/${sessionId}/resources`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )).data;
  },

  async downloadResource(resourceId: number): Promise<Blob> {
    return (await api.get(`/mentorship/sessions/resources/${resourceId}/download`, {
      responseType: "blob",
    })).data;
  },

  async deleteResource(resourceId: number): Promise<void> {
    await api.delete(`/mentorship/sessions/resources/${resourceId}`);
  },
};

export default mentorshipService;
