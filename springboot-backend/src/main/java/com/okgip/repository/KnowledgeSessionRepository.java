package com.okgip.repository;

import com.okgip.entity.KnowledgeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KnowledgeSessionRepository extends JpaRepository<KnowledgeSession, Long> {
    List<KnowledgeSession> findByHostMentorId(Long hostMentorId);
    List<KnowledgeSession> findByStatus(String status);
    List<KnowledgeSession> findBySkillId(Long skillId);
}
