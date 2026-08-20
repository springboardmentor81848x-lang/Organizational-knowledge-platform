package com.knowledgeiq.repository;

import com.knowledgeiq.model.Mentorship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorshipRepository extends JpaRepository<Mentorship, UUID> {
    List<Mentorship> findByMenteeId(UUID menteeId);
    List<Mentorship> findByMentorId(UUID mentorId);
    List<Mentorship> findByMenteeIdOrMentorIdOrderByCreatedAtDesc(UUID menteeId, UUID mentorId);
    List<Mentorship> findByMentorIdAndMenteeIdAndSkillIdAndStatusIn(UUID mentorId, UUID menteeId, UUID skillId, List<String> statuses);
    
    long countByMentorIdAndStatus(UUID mentorId, String status);
    long countByMenteeIdAndStatus(UUID menteeId, String status);
}
