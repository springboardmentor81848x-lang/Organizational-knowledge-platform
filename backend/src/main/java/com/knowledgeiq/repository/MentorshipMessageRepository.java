package com.knowledgeiq.repository;

import com.knowledgeiq.model.MentorshipMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorshipMessageRepository extends JpaRepository<MentorshipMessage, UUID> {
    List<MentorshipMessage> findByMentorshipIdOrderByCreatedAtAsc(UUID mentorshipId);
}
