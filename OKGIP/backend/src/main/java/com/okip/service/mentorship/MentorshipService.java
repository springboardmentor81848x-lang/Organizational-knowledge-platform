package com.okip.service.mentorship;

import java.util.List;

import com.okip.dto.mentorship.CreateFeedbackDTO;
import com.okip.dto.mentorship.CreateKnowledgeSessionDTO;
import com.okip.dto.mentorship.CreateMentorshipRequestDTO;
import com.okip.dto.mentorship.KnowledgeSessionDTO;
import com.okip.dto.mentorship.MentorRecommendationDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;

public interface MentorshipService {
    List<MentorRecommendationDTO> getRecommendations();
    List<MentorshipRequestDTO> getMyRequests();
    MentorshipRequestDTO createRequest(CreateMentorshipRequestDTO request);
    MentorshipRequestDTO acceptRequest(Long requestId);
    MentorshipRequestDTO rejectRequest(Long requestId);
    List<KnowledgeSessionDTO> getMySessions();
    List<MentorshipRequestDTO> getMyMentees();
    List<MentorshipRequestDTO> getMentorRequests();
    KnowledgeSessionDTO createSession(Long requestId, CreateKnowledgeSessionDTO request);
    KnowledgeSessionDTO completeSession(Long sessionId);
    KnowledgeSessionDTO cancelSession(Long sessionId);
    void submitFeedback(Long sessionId, CreateFeedbackDTO request);
}
