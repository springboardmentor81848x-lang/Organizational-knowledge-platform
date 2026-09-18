package com.okip.dto.assessment;

/**
 * Minimal DTO used to populate the Peer 360 / Manager Assessment target-employee
 * dropdown. Only the fields required for display are exposed — no sensitive HR data.
 */
public class PeerTargetDTO {

    private Long employeeId;
    private String employeeName;
    private String employeeCode;

    public PeerTargetDTO() {}

    public PeerTargetDTO(Long employeeId, String employeeName, String employeeCode) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeCode = employeeCode;
    }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
}
