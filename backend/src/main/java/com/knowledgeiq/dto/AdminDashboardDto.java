package com.knowledgeiq.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private int activeUsers;
    private int totalUsers;
    private int activeSessions;
    private int pendingApprovals;
    private String uptime;
    private String systemHealth;
    private String apiCalls;
    private String storage;
    private List<Map<String, Object>> usage;
    private List<Map<String, Object>> roleDist;
    private List<Map<String, Object>> users;
    private List<Map<String, Object>> audit;
    private List<Map<String, Object>> roleUsage;
    private List<Map<String, Object>> systemLogs;

    public AdminDashboardDto() {}

    public int getActiveUsers() { return activeUsers; }
    public void setActiveUsers(int activeUsers) { this.activeUsers = activeUsers; }

    public int getTotalUsers() { return totalUsers; }
    public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }

    public int getActiveSessions() { return activeSessions; }
    public void setActiveSessions(int activeSessions) { this.activeSessions = activeSessions; }

    public int getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(int pendingApprovals) { this.pendingApprovals = pendingApprovals; }

    public String getUptime() { return uptime; }
    public void setUptime(String uptime) { this.uptime = uptime; }

    public String getSystemHealth() { return systemHealth; }
    public void setSystemHealth(String systemHealth) { this.systemHealth = systemHealth; }

    public String getApiCalls() { return apiCalls; }
    public void setApiCalls(String apiCalls) { this.apiCalls = apiCalls; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }

    public List<Map<String, Object>> getUsage() { return usage; }
    public void setUsage(List<Map<String, Object>> usage) { this.usage = usage; }

    public List<Map<String, Object>> getRoleDist() { return roleDist; }
    public void setRoleDist(List<Map<String, Object>> roleDist) { this.roleDist = roleDist; }

    public List<Map<String, Object>> getUsers() { return users; }
    public void setUsers(List<Map<String, Object>> users) { this.users = users; }

    public List<Map<String, Object>> getAudit() { return audit; }
    public void setAudit(List<Map<String, Object>> audit) { this.audit = audit; }

    public List<Map<String, Object>> getRoleUsage() { return roleUsage; }
    public void setRoleUsage(List<Map<String, Object>> roleUsage) { this.roleUsage = roleUsage; }

    public List<Map<String, Object>> getSystemLogs() { return systemLogs; }
    public void setSystemLogs(List<Map<String, Object>> systemLogs) { this.systemLogs = systemLogs; }
}
