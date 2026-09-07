package com.okip.dto.report;

import java.time.LocalDateTime;

public class ReportSummaryDTO {
    private String reportType;
    private LocalDateTime generatedAt;
    private String generatedBy;
    private int recordCount;

    public ReportSummaryDTO() {}

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }

    public int getRecordCount() { return recordCount; }
    public void setRecordCount(int recordCount) { this.recordCount = recordCount; }
}
