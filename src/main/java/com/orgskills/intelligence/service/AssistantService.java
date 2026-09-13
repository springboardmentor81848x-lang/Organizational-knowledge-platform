package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assistant.AssistantChatRequest;
import com.orgskills.intelligence.dto.assistant.AssistantChatResponse;
import com.orgskills.intelligence.dto.assistant.AssistantMessage;
import com.orgskills.intelligence.service.AssistantContextService.AssistantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * The assistant: questions about your own development, answered against your own data.
 *
 * <h2>Why it is grounded rather than open</h2>
 * A model asked "what should I learn next?" with no context will answer confidently about
 * courses that do not exist in this catalogue and gaps the employee does not have. So every
 * reply is built on a snapshot of the caller's real rows — role, gaps, recommendations,
 * enrolments, proficiencies — and the courses shown beside the answer are picked by
 * {@link RecommendationScoringService}, not named by the model. The model writes the prose; the
 * platform decides the facts.
 *
 * <h2>Why there is an answer without a model</h2>
 * {@code llm.mock.enabled} defaults to true and an API key is optional, which is the state the
 * project runs in by default. Rather than degrade to an error, the offline path answers the same
 * questions from the same snapshot with templated prose, and the response says plainly that no
 * model was involved — see {@link AssistantChatResponse#isAnsweredByModel()}.
 *
 * <h2>Scope</h2>
 * Read-only. The assistant explains, recommends and points at the screen that does the thing; it
 * does not enrol anyone or write to their record on their behalf.
 *
 * <p>This class deliberately carries no {@code @Transactional}: reading the caller's record
 * belongs to {@link AssistantContextService}, and the model call that follows must not hold a
 * database connection while it waits on the network.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssistantService {

    private final AssistantContextService assistantContextService;
    private final LlmClient llmClient;

    /** How many prior turns are replayed to the model. Enough to follow a thread, bounded. */
    private static final int MAX_HISTORY_TURNS = 10;

    private static final String SYSTEM_PROMPT = """
            You are the learning assistant inside the Skills Intelligence Platform, an internal \
            tool where employees track their skills, see the gaps between their current \
            proficiency and what their role requires, and take courses to close them.

            You are talking to the employee described in the CONTEXT block. Everything you say \
            about their skills, gaps, recommendations and progress must come from that block.

            Rules:
            - Never invent a course, a provider, a skill or a number. If the CONTEXT does not \
            contain something, say you cannot see it rather than guessing.
            - Courses are shown to the user separately, chosen by the platform's own ranking. \
            You may refer to a course listed in the CONTEXT by name, but never make one up.
            - When a question is about using the platform, answer it and name the screen that \
            does the job, using the SCREENS list.
            - If the question has nothing to do with skills, learning, careers or this platform, \
            say that it is outside what you can help with and offer something you can do.
            - Be concrete and brief: two short paragraphs at most, plain sentences. No markdown \
            headings, no bullet characters, no bold. Address the person as "you".
            """;

    public AssistantChatResponse chat(Long userId, AssistantChatRequest request) {
        String question = request.getMessage().trim();
        AssistantContext context = assistantContextService.prepare(userId, question);

        if (llmClient.isLive()) {
            try {
                String answer = llmClient.completeText(SYSTEM_PROMPT,
                        buildTurns(request.getHistory(), context, question)).trim();
                return respond(answer, context, true);
            } catch (Exception ex) {
                log.error("Assistant LLM call failed — answering from the grounded offline path", ex);
            }
        }

        return respond(context.offlineAnswer(), context, false);
    }

    /** Opening prompts, phrased against what this particular person actually has on file. */
    public List<String> starterQuestions(Long userId) {
        return assistantContextService.starterQuestions(userId);
    }

    private AssistantChatResponse respond(String answer, AssistantContext context, boolean byModel) {
        return AssistantChatResponse.builder()
                .answer(answer)
                .suggestedCourses(context.suggestedCourses())
                .followUps(context.followUps())
                .answeredByModel(byModel)
                .build();
    }

    private List<LlmClient.Turn> buildTurns(List<AssistantMessage> history, AssistantContext context,
                                            String question) {
        List<LlmClient.Turn> turns = new ArrayList<>();

        List<AssistantMessage> recent = history.size() > MAX_HISTORY_TURNS
                ? history.subList(history.size() - MAX_HISTORY_TURNS, history.size())
                : history;
        for (AssistantMessage message : recent) {
            if (message.getContent() == null || message.getContent().isBlank()) {
                continue;
            }
            turns.add("assistant".equalsIgnoreCase(message.getRole())
                    ? LlmClient.Turn.assistant(message.getContent())
                    : LlmClient.Turn.user(message.getContent()));
        }

        // The context rides on the final user turn rather than the system prompt so it reflects
        // the data as of this question, not as of whenever the conversation started.
        turns.add(LlmClient.Turn.user(
                "CONTEXT\n" + context.promptContext() + "\nQUESTION\n" + question));
        return turns;
    }
}
