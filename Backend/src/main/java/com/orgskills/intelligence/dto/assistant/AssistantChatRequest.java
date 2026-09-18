package com.orgskills.intelligence.dto.assistant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * A question for the assistant, with as much of the conversation as the client wants carried.
 *
 * <p>The server keeps no conversation state, so the history travels with each turn. That is the
 * reason for the size caps: without them the prompt would grow with the conversation until the
 * model's context ran out, and a caller could make the platform pay for an arbitrarily large
 * request. The service trims to the most recent turns regardless.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssistantChatRequest {

    @NotBlank(message = "Message must not be empty")
    @Size(max = 2000, message = "Message must be 2000 characters or fewer")
    private String message;

    @Size(max = 40, message = "History must be 40 turns or fewer")
    private List<AssistantMessage> history = new ArrayList<>();

    public List<AssistantMessage> getHistory() {
        return history == null ? List.of() : history;
    }
}
