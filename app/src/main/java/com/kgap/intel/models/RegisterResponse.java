package com.kgap.intel.models;

public class RegisterResponse {
    private String token;
    public String getToken() { return token; }
    public boolean isSuccess() { return token != null; }
}
