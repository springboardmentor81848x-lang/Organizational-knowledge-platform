package com.knowledgegap.dto;

import java.util.List;

public class LearningAnalytics {

    private Long mentorId;

    private Long totalSessions;
    private Long completedSessions;
    private Long totalRegistrations;
    private Long totalAttended;

    private Double attendanceRate;
    private Double averageEffectiveness;

    private Long totalFeedback;

    private List<SessionAnalytics> sessionAnalytics;

    public LearningAnalytics() {
    }

    public LearningAnalytics(
            Long mentorId,
            Long totalSessions,
            Long completedSessions,
            Long totalRegistrations,
            Long totalAttended,
            Double attendanceRate,
            Double averageEffectiveness,
            Long totalFeedback,
            List<SessionAnalytics> sessionAnalytics) {

        this.mentorId = mentorId;
        this.totalSessions = totalSessions;
        this.completedSessions = completedSessions;
        this.totalRegistrations = totalRegistrations;
        this.totalAttended = totalAttended;
        this.attendanceRate = attendanceRate;
        this.averageEffectiveness = averageEffectiveness;
        this.totalFeedback = totalFeedback;
        this.sessionAnalytics = sessionAnalytics;
    }

    public Long getMentorId() {
        return mentorId;
    }

    public void setMentorId(Long mentorId) {
        this.mentorId = mentorId;
    }

    public Long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public Long getCompletedSessions() {
        return completedSessions;
    }

    public void setCompletedSessions(Long completedSessions) {
        this.completedSessions = completedSessions;
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

    public Double getAverageEffectiveness() {
        return averageEffectiveness;
    }

    public void setAverageEffectiveness(Double averageEffectiveness) {
        this.averageEffectiveness = averageEffectiveness;
    }

    public Long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(Long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public List<SessionAnalytics> getSessionAnalytics() {
        return sessionAnalytics;
    }

    public void setSessionAnalytics(
            List<SessionAnalytics> sessionAnalytics) {

        this.sessionAnalytics = sessionAnalytics;
    }
}