package com.okip.service.session;

import java.util.List;
import com.okip.dto.session.KnowledgeSessionRequestDTO;
import com.okip.dto.session.KnowledgeSessionResponseDTO;
import com.okip.dto.session.SessionFeedbackDTO;
import com.okip.dto.session.SessionRegistrationDTO;

public interface KnowledgeSessionService {
    KnowledgeSessionResponseDTO createSession(KnowledgeSessionRequestDTO request);
    List<KnowledgeSessionResponseDTO> getAllUpcomingSessions();
    List<KnowledgeSessionResponseDTO> getAllSessions();
    KnowledgeSessionResponseDTO getSessionById(Long sessionId);
    SessionRegistrationDTO registerForSession(Long sessionId);
    void cancelRegistration(Long sessionId);
    List<SessionRegistrationDTO> getMyRegisteredSessions();
    SessionRegistrationDTO submitFeedback(Long sessionId, SessionFeedbackDTO feedback);
    List<SessionRegistrationDTO> getSessionRegistrations(Long sessionId);
}
