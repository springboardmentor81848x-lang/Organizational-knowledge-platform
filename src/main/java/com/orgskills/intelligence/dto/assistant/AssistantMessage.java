package com.orgskills.intelligence.dto.assistant;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One turn of a conversation. {@code role} is either {@code user} or {@code assistant}. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssistantMessage {

    private String role;

    @Size(max = 4000, message = "A conversation turn must be 4000 characters or fewer")
    private String content;
}
