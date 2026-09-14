package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.MentorshipSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {
    List<MentorshipSession> findByEmployeeEmail(String employeeEmail);
    List<MentorshipSession> findByMentorId(String mentorId);
}
