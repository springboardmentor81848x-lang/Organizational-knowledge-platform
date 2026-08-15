package com.kgap.intel.models;

public class MentorDashboardStats {
    public int assignedMentees;
    public int activeMentorships;
    public int pendingRequests;
    public int upcomingSessions;
    public int pendingInterventions;

    public MentorDashboardStats(int assignedMentees, int activeMentorships, int pendingRequests, int upcomingSessions, int pendingInterventions) {
        this.assignedMentees = assignedMentees;
        this.activeMentorships = activeMentorships;
        this.pendingRequests = pendingRequests;
        this.upcomingSessions = upcomingSessions;
        this.pendingInterventions = pendingInterventions;
    }
}
