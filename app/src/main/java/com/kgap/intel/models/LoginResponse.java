package com.kgap.intel.models;

public class LoginResponse {
    private String token;
    private String name;
    private String role;
    private String email;

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getEmail() { return email; }
}
