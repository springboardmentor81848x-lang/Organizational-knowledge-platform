package com.kgap.intel.models;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String role;

    public RegisterRequest(String fullName, String email, String password, String role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
