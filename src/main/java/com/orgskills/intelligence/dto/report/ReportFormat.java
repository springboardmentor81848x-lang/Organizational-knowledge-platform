package com.orgskills.intelligence.dto.report;

import com.orgskills.intelligence.exception.ValidationException;

/** The two document formats every report supports, with the wire details each one needs. */
public enum ReportFormat {

    PDF("application/pdf", "pdf"),
    EXCEL("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx");

    private final String contentType;
    private final String extension;

    ReportFormat(String contentType, String extension) {
        this.contentType = contentType;
        this.extension = extension;
    }

    public String getContentType() {
        return contentType;
    }

    public String getExtension() {
        return extension;
    }

    /**
     * Parses the {@code format} query parameter. Accepts the spelling the API documents plus the
     * file extension people naturally type; anything else is rejected rather than silently
     * defaulting, so a typo does not hand back a PDF to a caller expecting a spreadsheet.
     */
    public static ReportFormat from(String value) {
        if (value == null || value.isBlank()) {
            return PDF;
        }
        return switch (value.trim().toLowerCase()) {
            case "pdf" -> PDF;
            case "excel", "xlsx", "xls" -> EXCEL;
            default -> throw new ValidationException(
                    "Unsupported report format: " + value + ". Use 'pdf' or 'excel'.");
        };
    }
}
