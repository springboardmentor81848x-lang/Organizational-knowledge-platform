package com.knowledgeiq.dto;

import java.util.Map;

public class GoogleAuthRequest {
    private String accessToken;
    private Map<String, Object> userInfo;

    public GoogleAuthRequest() {}

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public Map<String, Object> getUserInfo() { return userInfo; }
    public void setUserInfo(Map<String, Object> userInfo) { this.userInfo = userInfo; }

    // Convenience helpers
    public String getEmail() {
        if (userInfo == null) return null;
        Object v = userInfo.get("email");
        return v != null ? v.toString() : null;
    }

    public String getFullName() {
        if (userInfo == null) return null;
        Object v = userInfo.get("name");
        if (v != null) return v.toString();
        // Fallback: given_name + family_name
        Object given = userInfo.get("given_name");
        Object family = userInfo.get("family_name");
        if (given != null || family != null) {
            return ((given != null ? given.toString() : "") + " " + (family != null ? family.toString() : "")).trim();
        }
        return null;
    }

    public String getAvatarUrl() {
        if (userInfo == null) return null;
        Object v = userInfo.get("picture");
        return v != null ? v.toString() : null;
    }
}
