package com.knowledgegap.dto;

public class SessionAnalytics {

    private Long sessionId;
    private String title;
    private String status;

    private Long totalRegistrations;
    private Long totalAttended;

    private Double attendanceRate;

    private Long totalFeedback;

    private Double averageRating;
    private Double effectiveness;

    public SessionAnalytics() {
    }

    public SessionAnalytics(
            Long sessionId,
            String title,
            String status,
            Long totalRegistrations,
            Long totalAttended,
            Double attendanceRate,
            Long totalFeedback,
            Double averageRating,
            Double effectiveness) {

        this.sessionId = sessionId;
        this.title = title;
        this.status = status;
        this.totalRegistrations = totalRegistrations;
        this.totalAttended = totalAttended;
        this.attendanceRate = attendanceRate;
        this.totalFeedback = totalFeedback;
        this.averageRating = averageRating;
        this.effectiveness = effectiveness;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(Long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public Long getTotalAttended() {
        return totalAttended;
    }

    public void setTotalAttended(Long totalAttended) {
        this.totalAttended = totalAttended;
    }

    public Double getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(Double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public Long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(Long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Double getEffectiveness() {
        return effectiveness;
    }

    public void setEffectiveness(Double effectiveness) {
        this.effectiveness = effectiveness;
    }
}