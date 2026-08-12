package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;

public class JobRoleResponse {
    private Long id;
    
    @SerializedName("roleName")
    private String name;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
