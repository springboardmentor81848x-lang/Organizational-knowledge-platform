package com.orgskills.intelligence.dto.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * The assistant's reply.
 *
 * <p>{@code suggestedCourses} is chosen by the platform's own scoring rather than by the model,
 * so the courses named alongside an answer are real catalogue rows the reader can open — a model
 * left to name courses on its own will invent plausible ones.
 *
 * <p>{@code answeredByModel} is false when the reply came from the grounded offline path (mock
 * mode, or no API key). The client shows that plainly instead of passing a templated answer off
 * as a model's.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantChatResponse {
    private String answer;
    private List<SuggestedCourse> suggestedCourses;
    private List<String> followUps;
    private boolean answeredByModel;
}
