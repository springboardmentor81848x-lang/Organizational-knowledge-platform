package com.okip.dto.manager;

import java.util.ArrayList;
import java.util.List;

public class ManagerEmployeeOptionDTO {
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String email;
    private String departmentName;
    private String currentJobRole;
    private boolean alreadyInMyTeam;
    private List<Long> assignedJobRoleIds = new ArrayList<>();
    private List<String> assignedJobRoleNames = new ArrayList<>();

    public Long getEmployeeId(){ return employeeId; }
    public void setEmployeeId(Long v){ employeeId=v; }
    public String getEmployeeCode(){ return employeeCode; }
    public void setEmployeeCode(String v){ employeeCode=v; }
    public String getEmployeeName(){ return employeeName; }
    public void setEmployeeName(String v){ employeeName=v; }
    public String getEmail(){ return email; }
    public void setEmail(String v){ email=v; }
    public String getDepartmentName(){ return departmentName; }
    public void setDepartmentName(String v){ departmentName=v; }
    public String getCurrentJobRole(){ return currentJobRole; }
    public void setCurrentJobRole(String v){ currentJobRole=v; }
    public boolean isAlreadyInMyTeam(){ return alreadyInMyTeam; }
    public void setAlreadyInMyTeam(boolean v){ alreadyInMyTeam=v; }
    public List<Long> getAssignedJobRoleIds(){ return assignedJobRoleIds; }
    public void setAssignedJobRoleIds(List<Long> v){ assignedJobRoleIds = v == null ? new ArrayList<>() : v; }
    public List<String> getAssignedJobRoleNames(){ return assignedJobRoleNames; }
    public void setAssignedJobRoleNames(List<String> v){ assignedJobRoleNames = v == null ? new ArrayList<>() : v; }
}
