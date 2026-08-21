package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.SessionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRegistrationRepository extends JpaRepository<SessionRegistration, Long> {
    List<SessionRegistration> findBySessionId(Long sessionId);
    List<SessionRegistration> findByAttendeeId(Long attendeeId);
}
