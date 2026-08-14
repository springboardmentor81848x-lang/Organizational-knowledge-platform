package com.knowledgeiq.dto;

import java.util.List;
import java.util.Map;

public class HrDashboardDto {
    private int totalEmployees;
    private int criticalGaps;
    private int avgCompletion;
    private String roi;
    private int coverage;
    private int atRisk;
    private String trainingSpend;
    private int mentorSessions;
    private List<Map<String, Object>> coverageTrend;
    private List<Map<String, Object>> deptGaps;
    private List<Map<String, Object>> training;
    private List<Map<String, Object>> certStatus;
    private List<Map<String, Object>> departments;
    private List<Map<String, Object>> alerts;
    private List<Map<String, Object>> usersTable;

    public HrDashboardDto() {}

    public int getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(int totalEmployees) { this.totalEmployees = totalEmployees; }

    public int getCriticalGaps() { return criticalGaps; }
    public void setCriticalGaps(int criticalGaps) { this.criticalGaps = criticalGaps; }

    public int getAvgCompletion() { return avgCompletion; }
    public void setAvgCompletion(int avgCompletion) { this.avgCompletion = avgCompletion; }

    public String getRoi() { return roi; }
    public void setRoi(String roi) { this.roi = roi; }

    public int getCoverage() { return coverage; }
    public void setCoverage(int coverage) { this.coverage = coverage; }

    public int getAtRisk() { return atRisk; }
    public void setAtRisk(int atRisk) { this.atRisk = atRisk; }

    public String getTrainingSpend() { return trainingSpend; }
    public void setTrainingSpend(String trainingSpend) { this.trainingSpend = trainingSpend; }

    public int getMentorSessions() { return mentorSessions; }
    public void setMentorSessions(int mentorSessions) { this.mentorSessions = mentorSessions; }

    public List<Map<String, Object>> getCoverageTrend() { return coverageTrend; }
    public void setCoverageTrend(List<Map<String, Object>> coverageTrend) { this.coverageTrend = coverageTrend; }

    public List<Map<String, Object>> getDeptGaps() { return deptGaps; }
    public void setDeptGaps(List<Map<String, Object>> deptGaps) { this.deptGaps = deptGaps; }

    public List<Map<String, Object>> getTraining() { return training; }
    public void setTraining(List<Map<String, Object>> training) { this.training = training; }

    public List<Map<String, Object>> getCertStatus() { return certStatus; }
    public void setCertStatus(List<Map<String, Object>> certStatus) { this.certStatus = certStatus; }

    public List<Map<String, Object>> getDepartments() { return departments; }
    public void setDepartments(List<Map<String, Object>> departments) { this.departments = departments; }

    public List<Map<String, Object>> getAlerts() { return alerts; }
    public void setAlerts(List<Map<String, Object>> alerts) { this.alerts = alerts; }

    public List<Map<String, Object>> getUsersTable() { return usersTable; }
    public void setUsersTable(List<Map<String, Object>> usersTable) { this.usersTable = usersTable; }
}
