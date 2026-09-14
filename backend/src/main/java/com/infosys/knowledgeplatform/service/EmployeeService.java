package com.infosys.knowledgeplatform.service;

import com.infosys.knowledgeplatform.model.*;
import com.infosys.knowledgeplatform.repository.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final UserRepository userRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final KnowledgeItemRepository knowledgeItemRepository;
    private final BookmarkRepository bookmarkRepository;
    private final FeedbackRepository feedbackRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    // ==================== Dashboard Overview ====================

    public Map<String, Object> getEmployeeDashboardOverview(String email) {
        Map<String, Object> dashboard = new HashMap<>();
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return null;

        // Personal stats
        dashboard.put("name", user.getName());
        dashboard.put("email", user.getEmail());
        dashboard.put("role", user.getRole());
        dashboard.put("targetRole", user.getTargetRole());
        dashboard.put("department", user.getDepartment());

        // Skills and gaps
        List<EmployeeSkill> skills = employeeSkillRepository.findByEmployeeEmail(email);
        dashboard.put("totalSkills", skills.size());
        dashboard.put("skillsWithGaps", skills.stream()
            .filter(s -> s.getProficiency() < s.getTargetProficiency())
            .count());

        // Training progress
        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeEmail(email);
        dashboard.put("totalEnrolled", enrollments.size());
        dashboard.put("completedTraining", enrollments.stream()
            .filter(e -> "completed".equals(e.getStatus()))
            .count());
        dashboard.put("inProgressTraining", enrollments.stream()
            .filter(e -> "in_progress".equals(e.getStatus()))
            .count());

        // Knowledge items
        List<KnowledgeItem> myKnowledge = knowledgeItemRepository.findByAuthorEmail(email);
        dashboard.put("myKnowledgeItems", myKnowledge.size());

        // Bookmarks
        List<Bookmark> bookmarks = bookmarkRepository.findActiveBookmarksByEmployee(email);
        dashboard.put("totalBookmarks", bookmarks.size());

        // Questions asked
        List<Question> questions = questionRepository.findByAskerEmail(email);
        dashboard.put("questionsAsked", questions.size());

        // Answers provided
        List<Answer> answers = answerRepository.findByAnswererEmail(email);
        dashboard.put("answersProvided", answers.size());

        return dashboard;
    }

    // ==================== My Knowledge ====================

    public List<Map<String, Object>> getMyKnowledge(String email) {
        List<KnowledgeItem> items = knowledgeItemRepository.findByAuthorEmail(email);
        return items.stream()
            .map(this::knowledgeItemToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> createKnowledgeItem(String email, KnowledgeItem item) {
        item.setAuthorEmail(email);
        item.setStatus("active");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        KnowledgeItem saved = knowledgeItemRepository.save(item);
        return knowledgeItemToMap(saved);
    }

    public Map<String, Object> updateKnowledgeItem(String email, Long itemId, KnowledgeItem updates) {
        Optional<KnowledgeItem> item = knowledgeItemRepository.findById(itemId);
        if (item.isEmpty() || !item.get().getAuthorEmail().equals(email)) {
            return null;
        }
        KnowledgeItem existing = item.get();
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getContent() != null) existing.setContent(updates.getContent());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getTags() != null) existing.setTags(updates.getTags());
        if (updates.getVisibility() != null) existing.setVisibility(updates.getVisibility());
        existing.setUpdatedAt(LocalDateTime.now());
        KnowledgeItem saved = knowledgeItemRepository.save(existing);
        return knowledgeItemToMap(saved);
    }

    // ==================== Recommended Resources ====================

    public List<Map<String, Object>> getRecommendedResources(String email) {
        List<EmployeeSkill> gaps = employeeSkillRepository.findByEmployeeEmail(email).stream()
            .filter(s -> s.getProficiency() < s.getTargetProficiency())
            .collect(Collectors.toList());

        Set<Map<String, Object>> recommendations = new LinkedHashSet<>();
        for (EmployeeSkill gap : gaps) {
            List<KnowledgeItem> items = knowledgeItemRepository.findByTag(gap.getSkillName());
            items.forEach(item -> recommendations.add(knowledgeItemToMap(item)));
        }

        return new ArrayList<>(recommendations);
    }

    public List<Map<String, Object>> searchKnowledge(String keyword) {
        List<KnowledgeItem> items = knowledgeItemRepository.searchByKeyword(keyword);
        return items.stream()
            .map(this::knowledgeItemToMap)
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getKnowledgeByCategory(String category) {
        List<KnowledgeItem> items = knowledgeItemRepository.findByCategory(category);
        return items.stream()
            .map(this::knowledgeItemToMap)
            .collect(Collectors.toList());
    }

    // ==================== Knowledge Gaps ====================

    public List<Map<String, Object>> getKnowledgeGaps(String email) {
        List<EmployeeSkill> gaps = employeeSkillRepository.findByEmployeeEmail(email).stream()
            .filter((EmployeeSkill s) -> s.getProficiency() != null && s.getTargetProficiency() != null && s.getProficiency() < s.getTargetProficiency())
            .sorted(Comparator.comparingInt((EmployeeSkill s) -> s.getTargetProficiency() - s.getProficiency()).reversed())
            .collect(Collectors.toList());

        return gaps.stream()
            .map(this::skillGapToMap)
            .collect(Collectors.toList());
    }

    // ==================== Assigned Training ====================

    public List<Map<String, Object>> getAssignedTraining(String email) {
        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeEmail(email);
        return enrollments.stream()
            .map(this::enrollmentToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> enrollInTraining(String email, Long programId, String programTitle, String provider) {
        Enrollment enrollment = new Enrollment();
        enrollment.setEmployeeEmail(email);
        enrollment.setProgramId(programId);
        enrollment.setProgramTitle(programTitle);
        enrollment.setProvider(provider);
        enrollment.setStatus("enrolled");
        enrollment.setProgressPercent(0);
        enrollment.setEnrolledAt(java.time.LocalDateTime.now());
        Enrollment saved = enrollmentRepository.save(enrollment);
        return enrollmentToMap(saved);
    }

    public Map<String, Object> updateTrainingProgress(Long enrollmentId, Integer progressPercent) {
        Optional<Enrollment> enrollment = enrollmentRepository.findById(enrollmentId);
        if (enrollment.isEmpty()) return null;
        
        Enrollment existing = enrollment.get();
        existing.setProgressPercent(progressPercent);
        if (progressPercent >= 100) {
            existing.setStatus("completed");
            existing.setCompletedAt(java.time.LocalDateTime.now());
        } else if (progressPercent > 0) {
            existing.setStatus("in_progress");
        }
        Enrollment saved = enrollmentRepository.save(existing);
        return enrollmentToMap(saved);
    }

    // ==================== Learning Progress ====================

    public Map<String, Object> getLearningProgress(String email) {
        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeEmail(email);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("totalEnrolled", enrollments.size());
        progress.put("completedCount", enrollments.stream().filter(e -> "completed".equals(e.getStatus())).count());
        progress.put("inProgressCount", enrollments.stream().filter(e -> "in_progress".equals(e.getStatus())).count());
        
        double avgProgress = enrollments.stream()
            .mapToInt(Enrollment::getProgressPercent)
            .average()
            .orElse(0.0);
        progress.put("averageProgress", Math.round(avgProgress * 100.0) / 100.0);
        
        progress.put("trainings", enrollments.stream()
            .map(this::enrollmentToMap)
            .collect(Collectors.toList()));
        
        return progress;
    }

    // ==================== Bookmarks ====================

    public List<Map<String, Object>> getBookmarks(String email) {
        List<Bookmark> bookmarks = bookmarkRepository.findActiveBookmarksByEmployee(email);
        return bookmarks.stream()
            .map(this::bookmarkToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> addBookmark(String email, Long knowledgeItemId) {
        Optional<KnowledgeItem> item = knowledgeItemRepository.findById(knowledgeItemId);
        if (item.isEmpty()) return null;

        KnowledgeItem knowledge = item.get();
        Bookmark existing = bookmarkRepository.findByEmployeeAndItem(email, knowledgeItemId);
        
        if (existing != null) {
            existing.setIsActive(true);
            existing.setBookmarkedAt(LocalDateTime.now());
            Bookmark saved = bookmarkRepository.save(existing);
            return bookmarkToMap(saved);
        }

        Bookmark bookmark = new Bookmark();
        bookmark.setEmployeeEmail(email);
        bookmark.setKnowledgeItemId(knowledgeItemId);
        bookmark.setItemTitle(knowledge.getTitle());
        bookmark.setItemAuthor(knowledge.getAuthorEmail());
        bookmark.setItemCategory(knowledge.getCategory());
        bookmark.setBookmarkedAt(LocalDateTime.now());
        bookmark.setIsActive(true);
        Bookmark saved = bookmarkRepository.save(bookmark);
        return bookmarkToMap(saved);
    }

    public Boolean removeBookmark(String email, Long bookmarkId) {
        Optional<Bookmark> bookmark = bookmarkRepository.findById(bookmarkId);
        if (bookmark.isEmpty() || !bookmark.get().getEmployeeEmail().equals(email)) {
            return false;
        }
        bookmark.get().setIsActive(false);
        bookmarkRepository.save(bookmark.get());
        return true;
    }

    // ==================== Q&A Functionality ====================

    public List<Map<String, Object>> getMyQuestions(String email) {
        List<Question> questions = questionRepository.findByAskerEmail(email);
        return questions.stream()
            .map(this::questionToMap)
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRecentQuestions() {
        List<Question> questions = questionRepository.findOpenQuestions();
        return questions.stream()
            .limit(20)
            .map(this::questionToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> askQuestion(String email, Question question) {
        question.setAskerEmail(email);
        question.setStatus("open");
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        question.setIsAnswered(false);
        Question saved = questionRepository.save(question);
        return questionToMap(saved);
    }

    public List<Map<String, Object>> getAnswersForQuestion(Long questionId) {
        List<Answer> answers = answerRepository.findByQuestionId(questionId);
        return answers.stream()
            .map(this::answerToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> answerQuestion(String email, Long questionId, String content) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isEmpty()) return null;

        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setAnswererEmail(email);
        answer.setContent(content);
        answer.setCreatedAt(LocalDateTime.now());
        answer.setUpdatedAt(LocalDateTime.now());
        answer.setStatus("active");
        Answer saved = answerRepository.save(answer);
        
        return answerToMap(saved);
    }

    public Boolean acceptAnswer(String email, Long questionId, Long answerId) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isEmpty() || !question.get().getAskerEmail().equals(email)) {
            return false;
        }

        Optional<Answer> answer = answerRepository.findById(answerId);
        if (answer.isEmpty()) return false;

        Question q = question.get();
        q.setIsAnswered(true);
        q.setAcceptedAnswerId(answerId);
        q.setStatus("resolved");
        q.setResolvedAt(LocalDateTime.now());
        questionRepository.save(q);

        Answer a = answer.get();
        a.setIsAccepted(true);
        answerRepository.save(a);

        return true;
    }

    // ==================== Feedback & Ratings ====================

    public Map<String, Object> giveFeedback(String email, Long knowledgeItemId, Feedback feedback) {
        Optional<KnowledgeItem> item = knowledgeItemRepository.findById(knowledgeItemId);
        if (item.isEmpty()) return null;

        feedback.setEmployeeEmail(email);
        feedback.setKnowledgeItemId(knowledgeItemId);
        feedback.setItemTitle(item.get().getTitle());
        feedback.setStatus("active");
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());
        Feedback saved = feedbackRepository.save(feedback);

        // Update knowledge item rating
        Double avgRating = feedbackRepository.getAverageRatingForItem(knowledgeItemId);
        Integer count = feedbackRepository.countFeedbackForItem(knowledgeItemId);
        if (avgRating != null) {
            KnowledgeItem knowledge = item.get();
            knowledge.setRating(avgRating.intValue());
            knowledge.setRatingCount(count != null ? count : 0);
            knowledgeItemRepository.save(knowledge);
        }

        return feedbackToMap(saved);
    }

    public List<Map<String, Object>> getFeedbackOnResource(Long knowledgeItemId) {
        List<Feedback> feedbacks = feedbackRepository.findByKnowledgeItem(knowledgeItemId);
        return feedbacks.stream()
            .map(this::feedbackToMap)
            .collect(Collectors.toList());
    }

    // ==================== Recent Activity ====================

    public List<Map<String, Object>> getRecentActivity(String email) {
        List<Map<String, Object>> activity = new ArrayList<>();

        // Recent questions asked
        List<Question> questions = questionRepository.findByAskerEmail(email);
        questions.stream()
            .limit(5)
            .forEach(q -> {
                Map<String, Object> item = new HashMap<>();
                item.put("type", "QUESTION");
                item.put("timestamp", q.getCreatedAt());
                item.put("title", q.getTitle());
                item.put("data", questionToMap(q));
                activity.add(item);
            });

        // Recent answers provided
        List<Answer> answers = answerRepository.findByAnswererEmail(email);
        answers.stream()
            .limit(5)
            .forEach(a -> {
                Map<String, Object> item = new HashMap<>();
                item.put("type", "ANSWER");
                item.put("timestamp", a.getCreatedAt());
                item.put("title", "Answered a question");
                item.put("data", answerToMap(a));
                activity.add(item);
            });

        // Recent bookmarks
        List<Bookmark> bookmarks = bookmarkRepository.findRecentBookmarks(email, 5);
        bookmarks.forEach(b -> {
            Map<String, Object> item = new HashMap<>();
            item.put("type", "BOOKMARK");
            item.put("timestamp", b.getBookmarkedAt());
            item.put("title", b.getItemTitle());
            item.put("data", bookmarkToMap(b));
            activity.add(item);
        });

        // Recent feedback given
        List<Feedback> feedbacks = feedbackRepository.findByEmployeeEmail(email);
        feedbacks.stream()
            .limit(5)
            .forEach(f -> {
                Map<String, Object> item = new HashMap<>();
                item.put("type", "FEEDBACK");
                item.put("timestamp", f.getCreatedAt());
                item.put("title", "Rated: " + f.getItemTitle());
                item.put("data", feedbackToMap(f));
                activity.add(item);
            });

        // Sort by timestamp descending
        activity.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
            LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
            return timeB.compareTo(timeA);
        });

        return activity.stream()
            .limit(20)
            .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private Map<String, Object> knowledgeItemToMap(KnowledgeItem item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", item.getId());
        map.put("title", item.getTitle());
        map.put("description", item.getDescription());
        map.put("content", item.getContent());
        map.put("authorEmail", item.getAuthorEmail());
        map.put("category", item.getCategory());
        map.put("tags", item.getTags());
        map.put("visibility", item.getVisibility());
        map.put("viewCount", item.getViewCount());
        map.put("helpfulCount", item.getHelpfulCount());
        map.put("rating", item.getRating());
        map.put("ratingCount", item.getRatingCount());
        map.put("createdAt", item.getCreatedAt());
        map.put("updatedAt", item.getUpdatedAt());
        map.put("status", item.getStatus());
        return map;
    }

    private Map<String, Object> skillGapToMap(EmployeeSkill skill) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", skill.getId());
        map.put("skillName", skill.getSkillName());
        map.put("current", skill.getProficiency());
        map.put("target", skill.getTargetProficiency());
        map.put("gap", skill.getTargetProficiency() - skill.getProficiency());
        map.put("proficiencyLevel", getProficiencyLevel(skill.getProficiency()));
        map.put("targetLevel", getProficiencyLevel(skill.getTargetProficiency()));
        map.put("lastUpdated", skill.getUpdatedAt());
        return map;
    }

    private String getProficiencyLevel(Integer level) {
        return switch (level) {
            case 1 -> "Beginner";
            case 2 -> "Intermediate";
            case 3 -> "Advanced";
            case 4 -> "Expert";
            default -> "Unknown";
        };
    }

    private Map<String, Object> enrollmentToMap(Enrollment enrollment) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", enrollment.getId());
        map.put("programTitle", enrollment.getProgramTitle());
        map.put("provider", enrollment.getProvider());
        map.put("status", enrollment.getStatus());
        map.put("progressPercent", enrollment.getProgressPercent());
        map.put("enrolledAt", enrollment.getEnrolledAt());
        map.put("completedAt", enrollment.getCompletedAt());
        return map;
    }

    private Map<String, Object> bookmarkToMap(Bookmark bookmark) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", bookmark.getId());
        map.put("itemTitle", bookmark.getItemTitle());
        map.put("itemAuthor", bookmark.getItemAuthor());
        map.put("itemCategory", bookmark.getItemCategory());
        map.put("folderName", bookmark.getFolderName());
        map.put("notes", bookmark.getNotes());
        map.put("bookmarkedAt", bookmark.getBookmarkedAt());
        return map;
    }

    private Map<String, Object> questionToMap(Question question) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", question.getId());
        map.put("title", question.getTitle());
        map.put("description", question.getDescription());
        map.put("topic", question.getTopic());
        map.put("status", question.getStatus());
        map.put("viewCount", question.getViewCount());
        map.put("answerCount", question.getAnswerCount());
        map.put("upvoteCount", question.getUpvoteCount());
        map.put("isAnswered", question.getIsAnswered());
        map.put("createdAt", question.getCreatedAt());
        map.put("updatedAt", question.getUpdatedAt());
        return map;
    }

    private Map<String, Object> answerToMap(Answer answer) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", answer.getId());
        map.put("questionId", answer.getQuestionId());
        map.put("answererEmail", answer.getAnswererEmail());
        map.put("content", answer.getContent());
        map.put("upvoteCount", answer.getUpvoteCount());
        map.put("downvoteCount", answer.getDownvoteCount());
        map.put("isAccepted", answer.getIsAccepted());
        map.put("expertise", answer.getExpertise());
        map.put("answerRating", answer.getAnswerRating());
        map.put("createdAt", answer.getCreatedAt());
        map.put("updatedAt", answer.getUpdatedAt());
        return map;
    }

    private Map<String, Object> feedbackToMap(Feedback feedback) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", feedback.getId());
        map.put("itemTitle", feedback.getItemTitle());
        map.put("rating", feedback.getRating());
        map.put("comment", feedback.getComment());
        map.put("category", feedback.getCategory());
        map.put("helpfulCount", feedback.getHelpfulCount());
        map.put("isAnonymous", feedback.getIsAnonymous());
        map.put("createdAt", feedback.getCreatedAt());
        return map;
    }
}
