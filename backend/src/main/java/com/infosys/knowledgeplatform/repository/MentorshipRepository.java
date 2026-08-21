package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Mentorship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipRepository extends JpaRepository<Mentorship, Long> {
    List<Mentorship> findByMentorId(Long mentorId);
    List<Mentorship> findByMenteeId(Long menteeId);
}
