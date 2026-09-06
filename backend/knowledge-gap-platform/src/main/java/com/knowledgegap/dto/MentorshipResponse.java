package com.knowledgegap.dto;

import java.time.LocalDate;

public class MentorshipResponse {

    private Long id;

    private String menteeEmployeeId;
    private String menteeName;

    private String mentorEmployeeId;
    private String mentorName;

    private Long skillId;
    private String skillName;

    private String goal;
    private String status;

    private LocalDate startDate;
    private LocalDate endDate;

    public MentorshipResponse() {
    }

    public MentorshipResponse(
            Long id,
            String menteeEmployeeId,
            String menteeName,
            String mentorEmployeeId,
            String mentorName,
            Long skillId,
            String skillName,
            String goal,
            String status,
            LocalDate startDate,
            LocalDate endDate) {

        this.id = id;
        this.menteeEmployeeId = menteeEmployeeId;
        this.menteeName = menteeName;
        this.mentorEmployeeId = mentorEmployeeId;
        this.mentorName = mentorName;
        this.skillId = skillId;
        this.skillName = skillName;
        this.goal = goal;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() {
        return id;
    }

    public String getMenteeEmployeeId() {
        return menteeEmployeeId;
    }

    public String getMenteeName() {
        return menteeName;
    }

    public String getMentorEmployeeId() {
        return mentorEmployeeId;
    }

    public String getMentorName() {
        return mentorName;
    }

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getGoal() {
        return goal;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
}