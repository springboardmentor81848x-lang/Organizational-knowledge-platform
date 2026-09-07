package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT c FROM ChatMessage c WHERE (c.senderId = :user1 AND c.recipientId = :user2) OR (c.senderId = :user2 AND c.recipientId = :user1) ORDER BY c.createdAt ASC")
    List<ChatMessage> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);
}
