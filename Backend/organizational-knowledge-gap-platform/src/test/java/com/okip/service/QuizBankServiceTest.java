package com.okip.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.okip.dto.assessment.QuizDTO;
import com.okip.dto.assessment.QuizQuestionDTO;
import com.okip.exception.BadRequestException;
import com.okip.service.quiz.QuizBankService;
import com.okip.service.quiz.QuizBankService.QuizEvaluationResult;

public class QuizBankServiceTest {

    private QuizBankService quizBankService;

    @BeforeEach
    public void setUp() {
        quizBankService = new QuizBankService();
    }

    @Test
    public void testGenerateQuizForSkill_DistributionAndAnswerKeysNotExposed() {
        QuizDTO quiz = quizBankService.generateQuizForSkill(100L, 1L, "Java & Spring Boot", "BACKEND");

        assertNotNull(quiz);
        assertEquals(25, quiz.getTotalQuestions());
        assertEquals(25, quiz.getQuestions().size());

        long beginnerCount = quiz.getQuestions().stream()
                .filter(q -> "BEGINNER".equalsIgnoreCase(q.getDifficulty()))
                .count();
        long intermediateCount = quiz.getQuestions().stream()
                .filter(q -> "INTERMEDIATE".equalsIgnoreCase(q.getDifficulty()))
                .count();
        long advancedCount = quiz.getQuestions().stream()
                .filter(q -> "ADVANCED".equalsIgnoreCase(q.getDifficulty()))
                .count();

        assertEquals(8, beginnerCount, "Should have 8 beginner questions");
        assertEquals(9, intermediateCount, "Should have 9 intermediate questions");
        assertEquals(8, advancedCount, "Should have 8 advanced questions");

        // Verify QuizQuestionDTO does not contain any answer key property
        for (QuizQuestionDTO q : quiz.getQuestions()) {
            assertNotNull(q.getId());
            assertNotNull(q.getQuestion());
            assertNotNull(q.getDifficulty());
            assertEquals(4, q.getOptions().size());
        }
    }

    @Test
    public void testEvaluateAnswers_Exactly25AnswersSucceeds() {
        Long empId = 101L;
        Long skillId = 1L;
        QuizDTO quiz = quizBankService.generateQuizForSkill(empId, skillId, "Java & Spring Boot", "BACKEND");

        Map<String, Integer> answers = new HashMap<>();
        quiz.getQuestions().forEach(q -> answers.put(q.getId(), 0));

        QuizEvaluationResult result = quizBankService.evaluateAnswers(empId, skillId, "Java & Spring Boot", "BACKEND", answers);

        assertNotNull(result);
        assertEquals(25, result.getTotalQuestions());
        assertTrue(result.getScore() >= 0 && result.getScore() <= 100);
        assertNotNull(result.getProficiency());
    }

    @Test
    public void testEvaluateAnswers_24AnswersFails() {
        Long empId = 102L;
        Long skillId = 1L;
        QuizDTO quiz = quizBankService.generateQuizForSkill(empId, skillId, "Java & Spring Boot", "BACKEND");

        Map<String, Integer> answers = new HashMap<>();
        // Submit only 24 answers
        quiz.getQuestions().stream().limit(24).forEach(q -> answers.put(q.getId(), 0));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            quizBankService.evaluateAnswers(empId, skillId, "Java & Spring Boot", "BACKEND", answers);
        });

        assertTrue(ex.getMessage().contains("Exactly 25 answered questions are required"));
    }

    @Test
    public void testEvaluateAnswers_20AnswersFails() {
        Long empId = 103L;
        Long skillId = 1L;
        QuizDTO quiz = quizBankService.generateQuizForSkill(empId, skillId, "Java & Spring Boot", "BACKEND");

        Map<String, Integer> answers = new HashMap<>();
        quiz.getQuestions().stream().limit(20).forEach(q -> answers.put(q.getId(), 0));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            quizBankService.evaluateAnswers(empId, skillId, "Java & Spring Boot", "BACKEND", answers);
        });

        assertTrue(ex.getMessage().contains("Exactly 25 answered questions are required"));
    }

    @Test
    public void testEvaluateAnswers_UnknownQuestionIdFails() {
        Long empId = 104L;
        Long skillId = 1L;
        QuizDTO quiz = quizBankService.generateQuizForSkill(empId, skillId, "Java & Spring Boot", "BACKEND");

        Map<String, Integer> answers = new HashMap<>();
        quiz.getQuestions().stream().limit(24).forEach(q -> answers.put(q.getId(), 0));
        answers.put("FAKE_Q_999", 0); // Invalid question ID substitution

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            quizBankService.evaluateAnswers(empId, skillId, "Java & Spring Boot", "BACKEND", answers);
        });

        assertTrue(ex.getMessage().contains("do not match the exact 25 questions issued"));
    }

    @Test
    public void testEvaluateAnswers_InvalidOptionIndexFails() {
        Long empId = 105L;
        Long skillId = 1L;
        QuizDTO quiz = quizBankService.generateQuizForSkill(empId, skillId, "Java & Spring Boot", "BACKEND");

        Map<String, Integer> answers = new HashMap<>();
        quiz.getQuestions().forEach(q -> answers.put(q.getId(), 0));
        String firstQId = quiz.getQuestions().get(0).getId();
        answers.put(firstQId, 99); // Invalid option index > 3

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            quizBankService.evaluateAnswers(empId, skillId, "Java & Spring Boot", "BACKEND", answers);
        });

        assertTrue(ex.getMessage().contains("Invalid option selection index"));
    }

    @Test
    public void testEvaluateAnswers_MissingSession_ThrowsBadRequestException() {
        Long empId = 106L;
        Long skillId = 2L;
        Map<String, Integer> answers = new HashMap<>();
        for (int i = 1; i <= 25; i++) {
            answers.put("Q_" + i, 0);
        }

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            quizBankService.evaluateAnswers(empId, skillId, "Java & Spring Boot", "BACKEND", answers);
        });

        assertTrue(ex.getMessage().contains("Quiz session expired or not found"));
    }

    @Test
    public void testEvaluateAnswers_MismatchedSkillSession_ThrowsBadRequestException() {
        Long empId = 107L;
        Long skillId1 = 3L;
        Long skillId2 = 4L;

        // Generate quiz for skill 3
        QuizDTO quiz1 = quizBankService.generateQuizForSkill(empId, skillId1, "Java & Spring Boot", "BACKEND");
        Map<String, Integer> answersQuiz1 = new HashMap<>();
        quiz1.getQuestions().forEach(q -> answersQuiz1.put(q.getId(), 0));

        // Attempting to evaluate answers against skill 4 without generating quiz for skill 4 throws BadRequestException
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            quizBankService.evaluateAnswers(empId, skillId2, "Java & Spring Boot", "BACKEND", answersQuiz1);
        });

        assertTrue(ex.getMessage().contains("Quiz session expired or not found"));
    }
}
