package com.knowledgegap.controller;

import com.knowledgegap.dto.ActiveChatDTO;
import com.knowledgegap.dto.MessageDTO;
import com.knowledgegap.dto.SendMessageRequest;
import com.knowledgegap.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // =========================================================
    // GET ACTIVE CHATS FOR AN EMPLOYEE
    // =========================================================

    @GetMapping("/active-chats/{employeeIdentifier}")
    public ResponseEntity<?> getActiveChats(
            @PathVariable String employeeIdentifier) {
        try {
            List<ActiveChatDTO> chats = messageService.getActiveChats(employeeIdentifier);
            return ResponseEntity.ok(chats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // GET MESSAGES FOR A PEER MENTORSHIP
    // =========================================================

    @GetMapping("/mentorship/{mentorshipId}")
    public ResponseEntity<?> getMessages(
            @PathVariable Long mentorshipId,
            @RequestParam(required = false) String employeeId) {
        try {
            List<MessageDTO> messages = messageService.getMessages(mentorshipId, employeeId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody SendMessageRequest request) {
        try {
            MessageDTO createdMessage = messageService.sendMessage(request);
            return ResponseEntity.ok(createdMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
