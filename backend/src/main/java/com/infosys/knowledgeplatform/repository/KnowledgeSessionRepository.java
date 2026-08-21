package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.KnowledgeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KnowledgeSessionRepository extends JpaRepository<KnowledgeSession, Long> {
    List<KnowledgeSession> findByHostId(Long hostId);
    List<KnowledgeSession> findBySessionDateAfter(LocalDateTime date);
}
