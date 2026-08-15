package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;

public class DepartmentResponse {
    private Long id;
    
    @SerializedName("departmentName")
    private String name;
    @SerializedName("name")
    private String nameAlt;
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { 
        return (name != null && !name.isEmpty()) ? name : nameAlt;
    }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
