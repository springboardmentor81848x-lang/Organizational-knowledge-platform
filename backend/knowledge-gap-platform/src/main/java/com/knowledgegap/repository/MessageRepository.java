package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByPeerMentorshipIdOrderBySentAtAsc(Long peerMentorshipId);

    Optional<Message> findTopByPeerMentorshipIdOrderBySentAtDesc(Long peerMentorshipId);

    long countByPeerMentorshipIdAndReceiverAndReadStatusFalse(Long peerMentorshipId, Employee receiver);

    long countByReceiverAndReadStatusFalse(Employee receiver);

    @Query("SELECT m FROM Message m WHERE m.peerMentorship.id = :mentorshipId AND m.receiver = :receiver AND m.readStatus = false")
    List<Message> findUnreadMessages(@Param("mentorshipId") Long mentorshipId, @Param("receiver") Employee receiver);
}
