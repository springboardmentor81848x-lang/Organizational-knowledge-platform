package com.knowledgeiq.dto;

import java.util.UUID;

public class CertificationDto {
    private UUID id;
    private UUID userId;
    private String name;
    private String issuingOrganization;
    private String issueDate;
    private String expirationDate;
    private String credentialId;
    private String credentialUrl;
    
    // New fields
    private UUID skillId;
    private String skillName;
    private String status;
    private String storagePath;
    private String fileType;
    private Long fileSize;
    private String assessmentStatus;
    private Double assessmentScore;

    public CertificationDto() {}

    public CertificationDto(UUID id, UUID userId, String name, String issuingOrganization, String issueDate, String expirationDate, String credentialId, String credentialUrl) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.issuingOrganization = issuingOrganization;
        this.issueDate = issueDate;
        this.expirationDate = expirationDate;
        this.credentialId = credentialId;
        this.credentialUrl = credentialUrl;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

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
}
