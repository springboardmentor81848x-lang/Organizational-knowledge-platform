package com.kgap.intel.models;

public class PeerAssessmentRequest {
    private Long targetEmployeeId;
    private String targetEmployeeName;
    private Long skillId;
    private String skillName;

    public PeerAssessmentRequest(Long targetEmployeeId, String targetEmployeeName, Long skillId, String skillName) {
        this.targetEmployeeId = targetEmployeeId;
        this.targetEmployeeName = targetEmployeeName;
        this.skillId = skillId;
        this.skillName = skillName;
    }

    public Long getTargetEmployeeId() { return targetEmployeeId; }
    public String getTargetEmployeeName() { return targetEmployeeName; }
    public Long getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
}
