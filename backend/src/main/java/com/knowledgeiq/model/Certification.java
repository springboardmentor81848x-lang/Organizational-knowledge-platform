package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "certifications")
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "name")
    private String name;

    @Column(name = "issuing_organization", nullable = false)
    private String issuingOrganization;

    @Column(name = "issue_date")
    private String issueDate;

    @Column(name = "expiration_date")
    private String expirationDate;

    @Column(name = "credential_id")
    private String credentialId;

    @Column(name = "credential_url", length = 1000)
    private String credentialUrl;

    @Column(name = "status")
    private String status = "UPLOADED"; // UPLOADED, ASSESSMENT_PENDING, COMPLETED

    @Column(name = "storage_path")
    private String storagePath;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "assessment_status")
    private String assessmentStatus = "Not Attempted"; // Not Attempted, Pending, Completed

    @Column(name = "assessment_score")
    private Double assessmentScore;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public Certification() {}

    public Certification(User user, String name, String issuingOrganization, String issueDate, String expirationDate, String credentialId, String credentialUrl) {
        this.user = user;
        this.name = name;
        this.title = name;
        this.issuingOrganization = issuingOrganization;
        this.issueDate = issueDate;
        this.expirationDate = expirationDate;
        this.credentialId = credentialId;
        this.credentialUrl = credentialUrl;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getName() { return name != null ? name : title; }
    public void setName(String name) {
        this.name = name;
        if (this.title == null) this.title = name;
    }

    public String getTitle() { return title != null ? title : name; }
    public void setTitle(String title) {
        this.title = title;
        if (this.name == null) this.name = title;
    }

    public String getIssuingOrganization() { return issuingOrganization; }
    public void setIssuingOrganization(String issuingOrganization) { this.issuingOrganization = issuingOrganization; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getExpirationDate() { return expirationDate; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }

    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getAssessmentStatus() { return assessmentStatus; }
    public void setAssessmentStatus(String assessmentStatus) { this.assessmentStatus = assessmentStatus; }

    public Double getAssessmentScore() { return assessmentScore; }
    public void setAssessmentScore(Double assessmentScore) { this.assessmentScore = assessmentScore; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
}
