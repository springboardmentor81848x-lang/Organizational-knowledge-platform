package com.knowledgeiq.dto;

import java.util.List;
import java.util.Map;

public class AiChatResponseDto {
    private String reply;
    private Map<String, Object> userSummary;
    private List<PersonalizedRecommendationDto> recommendations;

    public AiChatResponseDto() {}

    public AiChatResponseDto(String reply, Map<String, Object> userSummary, List<PersonalizedRecommendationDto> recommendations) {
        this.reply = reply;
        this.userSummary = userSummary;
        this.recommendations = recommendations;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public Map<String, Object> getUserSummary() { return userSummary; }
    public void setUserSummary(Map<String, Object> userSummary) { this.userSummary = userSummary; }

    public List<PersonalizedRecommendationDto> getRecommendations() { return recommendations; }
    public void setRecommendations(List<PersonalizedRecommendationDto> recommendations) { this.recommendations = recommendations; }
}
