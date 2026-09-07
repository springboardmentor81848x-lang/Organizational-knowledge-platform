package com.okip.service.report;

public interface ReportService {
    String generateMySkillGapsCsv();
    String generateEmployeeSkillGapsCsv(Long employeeId);
    String generateTeamSkillGapsCsv();
    String generateDepartmentGapsCsv();
    String generateTrainingReportCsv();
    String generateAssessmentReportCsv();
}
