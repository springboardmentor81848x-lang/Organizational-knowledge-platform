package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_sessions")
public class MentorshipSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mentorId;
    private String mentorName;
    private String employeeName;
    private String employeeEmail;
    private String topic;
    private String date;
    private String time;
    private String format;
    private String status; // Requested, Scheduled, Completed, Cancelled
    
    @Column(length = 1000)
    private String notes;
    
    private String meetingUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    public MentorshipSession() {}

    public MentorshipSession(String mentorId, String mentorName, String employeeName, String employeeEmail, String topic, String date, String time, String format, String status, String notes, String meetingUrl) {
        this.mentorId = mentorId;
        this.mentorName = mentorName;
        this.employeeName = employeeName;
        this.employeeEmail = employeeEmail;
        this.topic = topic;
        this.date = date;
        this.time = time;
        this.format = format;
        this.status = status;
        this.notes = notes;
        this.meetingUrl = meetingUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMentorId() { return mentorId; }
    public void setMentorId(String mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeEmail() { return employeeEmail; }
    public void setEmployeeEmail(String employeeEmail) { this.employeeEmail = employeeEmail; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMeetingUrl() { return meetingUrl; }
    public void setMeetingUrl(String meetingUrl) { this.meetingUrl = meetingUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
