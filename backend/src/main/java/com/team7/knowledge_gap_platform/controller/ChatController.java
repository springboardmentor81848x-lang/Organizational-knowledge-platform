package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.ChatMessage;
import com.team7.knowledge_gap_platform.repository.ChatMessageRepository;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessage>> getConversation(
            @RequestParam("user1") Long user1,
            @RequestParam("user2") Long user2) {
        List<ChatMessage> messages = chatMessageRepository.findConversation(user1, user2);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message) {
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }
        if (message.getIsRead() == null) {
            message.setIsRead(false);
        }
        ChatMessage saved = chatMessageRepository.save(message);
        return ResponseEntity.ok(saved);
    }
}
