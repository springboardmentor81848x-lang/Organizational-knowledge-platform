package com.team7.knowledge_gap_platform.dto;

import java.util.Set;

public class RoleDTO {
    
    private String roleName;
    private String description;
    private Set<String> permissions;
    
    public RoleDTO() {}
    
    public RoleDTO(String roleName, String description, Set<String> permissions) {
        this.roleName = roleName;
        this.description = description;
        this.permissions = permissions;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Set<String> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }
}
