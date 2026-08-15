package com.knowledgeiq.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UUID userId;
    private String email;
    private String fullName;
    private String systemRole;
    private String roleTitle;
    private String departmentName;
    private String teamName;
    private UUID organizationId;
    private String organizationName;

    public AuthResponse(String token, UUID userId, String email, String fullName, String systemRole, String roleTitle, String departmentName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.systemRole = systemRole;
        this.roleTitle = roleTitle;
        this.departmentName = departmentName;
    }

    public AuthResponse(String token, UUID userId, String email, String fullName, String systemRole, String roleTitle, String departmentName, String teamName, UUID organizationId, String organizationName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.systemRole = systemRole;
        this.roleTitle = roleTitle;
        this.departmentName = departmentName;
        this.teamName = teamName;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getSystemRole() { return systemRole; }
    public String getRoleTitle() { return roleTitle; }
    public String getDepartmentName() { return departmentName; }
    public String getTeamName() { return teamName; }
    public UUID getOrganizationId() { return organizationId; }
    public String getOrganizationName() { return organizationName; }
}
