package com.team7.knowledge_gap_platform.service;

import com.team7.knowledge_gap_platform.entity.Assessment;
import com.team7.knowledge_gap_platform.entity.AssessmentQuestion;
import com.team7.knowledge_gap_platform.entity.MentorProfile;
import com.team7.knowledge_gap_platform.entity.Skill;
import com.team7.knowledge_gap_platform.repository.AssessmentQuestionRepository;
import com.team7.knowledge_gap_platform.repository.AssessmentRepository;
import com.team7.knowledge_gap_platform.repository.MentorProfileRepository;
import com.team7.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DatabaseSeederService {

    private final SkillRepository skillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final MentorProfileRepository mentorProfileRepository;

    public DatabaseSeederService(SkillRepository skillRepository,
                                 AssessmentRepository assessmentRepository,
                                 AssessmentQuestionRepository questionRepository,
                                 MentorProfileRepository mentorProfileRepository) {
        this.skillRepository = skillRepository;
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.mentorProfileRepository = mentorProfileRepository;
    }

    @Transactional
    public String seedAll() {
        String assessments = seedAssessments();
        String mentors = seedMentors();
        return assessments + "\n" + mentors;
    }

    @Transactional
    public String seedMentors() {
        // We will designate specific employees as mentors for key skills
        // ID 2: Vikram Mehta (Backend/Java)
        // ID 16: Michael Chen (Senior Mentor)
        // ID 9: Sarah Johnson (Product)
        
        int created = 0;
        created += createMentorIfNotExists(2L, "Java & Spring Boot, REST API", 8, "Available", "Lead Backend Architect with 8+ years experience in microservices.");
        created += createMentorIfNotExists(16L, "Java, System Design, Backend", 12, "Available", "Senior Mentor specializing in scalable enterprise systems.");
        created += createMentorIfNotExists(9L, "Product Lifecycle, UI/UX", 5, "Busy", "Lead Product Manager focused on user-centric design and strategy.");
        created += createMentorIfNotExists(5L, "React & Modern Frontend", 4, "Available", "Frontend expert with deep knowledge in React hooks and performance.");

        return String.format("Mentor seeding complete. Created %d mentor profiles.", created);
    }

    private int createMentorIfNotExists(Long empId, String expertise, int years, String status, String bio) {
        if (mentorProfileRepository.findByEmployeeId(empId).isPresent()) return 0;
        
        MentorProfile profile = new MentorProfile();
        profile.setEmployeeId(empId);
        profile.setExpertise(expertise);
        profile.setExperienceYears(years);
        profile.setAvailability(status);
        profile.setBio(bio);
        mentorProfileRepository.save(profile);
        return 1;
    }

    @Transactional
    public String seedAssessments() {
        List<Skill> skills = skillRepository.findAll();
        if (skills.isEmpty()) {
            return "No skills found in database to seed assessments for.";
        }

        int assessmentsCreated = 0;
        int questionsCreated = 0;

        for (Skill skill : skills) {
            // Check if assessment already exists for this skill
            boolean exists = assessmentRepository.findBySkillIdAndAssessmentType(skill.getId(), "SELF").isPresent();
            
            if (!exists) {
                Assessment assessment = new Assessment();
                assessment.setTitle(skill.getSkillName() + " Self Assessment");
                assessment.setSkillId(skill.getId());
                assessment.setAssessmentType("SELF");
                assessment.setTotalQuestions(5);
                assessment = assessmentRepository.save(assessment);
                assessmentsCreated++;

                // Add 5 default questions for this skill
                questionsCreated += createDefaultQuestions(assessment.getId(), skill.getSkillName());
            }
        }

        return String.format("Seeding complete. Created %d assessments and %d questions.", assessmentsCreated, questionsCreated);
    }

    private int createDefaultQuestions(Long assessmentId, String skillName) {
        String[][] qData = {
            {"What is the primary purpose of " + skillName + "?", "Data Storage", "Logic Implementation", "User Interface", "All of the above", "B"},
            {"Which of the following is a key feature of " + skillName + "?", "Scalability", "High Performance", "Security", "All of the above", "D"},
            {"How do you initialize a basic project using " + skillName + "?", "Using a CLI tool", "Manual configuration", "Downloading a template", "It depends", "A"},
            {"What is a common best practice when working with " + skillName + "?", "Writing clean code", "Ignoring errors", "Using old versions", "Hardcoding values", "A"},
            {"Which community or organization maintains " + skillName + "?", "Open Source Community", "Microsoft", "Google", "Amazon", "A"}
        };

        for (String[] data : qData) {
            AssessmentQuestion q = new AssessmentQuestion();
            q.setAssessmentId(assessmentId);
            q.setQuestionText(data[0]);
            q.setOptionA(data[1]);
            q.setOptionB(data[2]);
            q.setOptionC(data[3]);
            q.setOptionD(data[4]);
            q.setCorrectAnswer(data[5]);
            questionRepository.save(q);
        }
        return qData.length;
    }
}
