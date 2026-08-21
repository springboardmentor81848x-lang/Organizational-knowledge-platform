package com.kgap.intel.models;

import java.io.Serializable;

public class KnowledgeSessionRegistration implements Serializable {
    private Long id;
    private Long sessionId;
    private Long employeeId;
    private String status;
    private Boolean attended;
    private String registeredAt;

    public KnowledgeSessionRegistration() {}

    public KnowledgeSessionRegistration(Long sessionId, Long employeeId) {
        this.sessionId = sessionId;
        this.employeeId = employeeId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getAttended() { return attended != null && attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }

    public String getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }
}
