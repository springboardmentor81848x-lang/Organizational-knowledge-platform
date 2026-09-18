package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * One multiple-choice question in the skill assessment bank.
 *
 * <p>Questions belong to a skill, not to a role. A role is assessed by gathering the questions
 * for the skills its competency profile names, which means a skill added to a second role brings
 * its questions with it and no question is ever written twice.
 *
 * <p>{@link #difficulty} is what turns a mark out of ten into a proficiency level. Each question
 * is tagged with the level it demonstrates, so answering the EXPERT questions correctly is what
 * earns EXPERT rather than simply answering many easy ones; see {@code QuizService} for how the
 * weighting works.
 */
@Entity
@Table(name = "assessment_questions", indexes = {
        @Index(name = "idx_assessment_questions_skill", columnList = "skill_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "question_text", nullable = false, length = 1000)
    private String questionText;

    @Column(name = "option_a", nullable = false, length = 500)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 500)
    private String optionB;

    @Column(name = "option_c", nullable = false, length = 500)
    private String optionC;

    @Column(name = "option_d", nullable = false, length = 500)
    private String optionD;

    /**
     * The correct choice, as "A", "B", "C" or "D".
     *
     * <p>Never serialised to the client while a quiz is in progress - see
     * {@code QuizQuestionResponse}, which deliberately has no field for it. Marking happens on
     * the server, so the answer key never leaves it.
     */
    @Column(name = "correct_option", nullable = false, length = 1)
    private String correctOption;

    /** The proficiency this question demonstrates when answered correctly. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProficiencyLevel difficulty;

    /** Shown after marking, so a wrong answer teaches something rather than just costing a point. */
    @Column(length = 1000)
    private String explanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    /** The four choices in order, for rendering. Index 0 is "A". */
    public List<String> optionsInOrder() {
        List<String> options = new ArrayList<>(4);
        options.add(optionA);
        options.add(optionB);
        options.add(optionC);
        options.add(optionD);
        return options;
    }

    public boolean isCorrect(String submitted) {
        return submitted != null && submitted.trim().equalsIgnoreCase(correctOption);
    }
}
