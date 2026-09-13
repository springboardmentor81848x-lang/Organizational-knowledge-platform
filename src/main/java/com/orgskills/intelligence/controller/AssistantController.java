package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.assistant.AssistantChatRequest;
import com.orgskills.intelligence.dto.assistant.AssistantChatResponse;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The assistant, always scoped to whoever is asking.
 *
 * <p>There is deliberately no employee id in these paths. Every other read in the platform takes
 * one and checks it, but an assistant that accepted one would be a way to ask the model about a
 * colleague's gaps in prose — so the caller is taken from the token and nothing else is offered.
 */
@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantService assistantService;

    /** Answers a question about the caller's own skills, gaps, training and progress. */
    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponse> chat(@AuthenticationPrincipal CustomPrincipal principal,
                                                      @Valid @RequestBody AssistantChatRequest request) {
        return ResponseEntity.ok(assistantService.chat(principal.getUserId(), request));
    }

    /** Opening prompts, chosen from what the caller actually has on record. */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> suggestions(@AuthenticationPrincipal CustomPrincipal principal) {
        return ResponseEntity.ok(assistantService.starterQuestions(principal.getUserId()));
    }
}
