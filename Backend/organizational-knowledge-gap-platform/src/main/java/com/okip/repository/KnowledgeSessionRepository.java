package com.okip.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.KnowledgeSession;
import com.okip.enums.SessionStatus;

@Repository
public interface KnowledgeSessionRepository extends JpaRepository<KnowledgeSession, Long> {
    List<KnowledgeSession> findByStatusOrderBySessionDateAsc(SessionStatus status);
    List<KnowledgeSession> findBySpeakerOrderBySessionDateDesc(Employee speaker);
    List<KnowledgeSession> findBySkillOrderBySessionDateDesc(Skill skill);
    List<KnowledgeSession> findBySessionDateAfterOrderBySessionDateAsc(LocalDateTime now);
    List<KnowledgeSession> findAllByOrderBySessionDateDesc();
}
