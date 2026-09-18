package com.orgskills.intelligence.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class OAuth2GoogleRequest {
    @NotBlank(message = "ID token is required")
    private String idToken;

    private String email;
    private String fullName;
    private String avatarUrl;

    public OAuth2GoogleRequest() {
    }

    public OAuth2GoogleRequest(String idToken, String email, String fullName, String avatarUrl) {
        this.idToken = idToken;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
