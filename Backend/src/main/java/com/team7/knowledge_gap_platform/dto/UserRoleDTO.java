package com.team7.knowledge_gap_platform.dto;

import java.util.Set;

public class UserRoleDTO {
    
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private String roleDescription;
    private Set<String> permissions;
    
    public UserRoleDTO() {}
    
    public UserRoleDTO(Long userId, String email, String fullName, String role,
                       String roleDescription, Set<String> permissions) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.roleDescription = roleDescription;
        this.permissions = permissions;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getRoleDescription() {
        return roleDescription;
    }
    
    public void setRoleDescription(String roleDescription) {
        this.roleDescription = roleDescription;
    }
    
    public Set<String> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }
}
