package com.team7.knowledge_gap_platform.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.AnalyticsResponse;

@Service
public class ReportService {

    private final AnalyticsService analyticsService;

    public ReportService(
            AnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }

    // =========================================================
    // EMPLOYEE REPORT
    // =========================================================

    public Map<String, Object> getEmployeeReport(
            Long employeeId) {

        AnalyticsResponse analytics =
                analyticsService
                        .getEmployeeAnalytics(
                                employeeId);

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "reportType",
                "EMPLOYEE");

        report.put(
                "generatedAt",
                LocalDateTime.now());

        report.put(
                "employee",
                analytics);

        return report;
    }

    // =========================================================
    // DEPARTMENT REPORT
    // =========================================================

    public Map<String, Object> getDepartmentReport(
            String departmentName) {

        List<AnalyticsResponse> analytics =
                analyticsService
                        .getDepartmentAnalytics(
                                departmentName);

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "reportType",
                "DEPARTMENT");

        report.put(
                "department",
                departmentName);

        report.put(
                "generatedAt",
                LocalDateTime.now());

        report.put(
                "employees",
                analytics);

        report.put(
                "totalEmployees",
                analytics.size());

        return report;
    }

    // =========================================================
    // ORGANIZATION REPORT
    // =========================================================

    public Map<String, Object> getOrganizationReport() {

        List<AnalyticsResponse> analytics =
                analyticsService
                        .getOrganizationAnalytics();

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "reportType",
                "ORGANIZATION");

        report.put(
                "generatedAt",
                LocalDateTime.now());

        report.put(
                "employees",
                analytics);

        report.put(
                "totalEmployees",
                analytics.size());

        return report;
    }

    // =========================================================
    // EMPLOYEE PDF EXPORT
    // =========================================================

    public byte[] generateEmployeePdf(
            Long employeeId) {

        AnalyticsResponse analytics =
                analyticsService
                        .getEmployeeAnalytics(
                                employeeId);

        try (PDDocument document =
                     new PDDocument();
             ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            PDPage page =
                    new PDPage();

            document.addPage(page);

            PDType1Font titleFont =
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA_BOLD);

            PDType1Font normalFont =
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream content =
                         new PDPageContentStream(
                                 document,
                                 page)) {

                float x = 50;
                float y = 750;

                content.beginText();

                content.setFont(
                        titleFont,
                        18);

                content.newLineAtOffset(
                        x,
                        y);

                content.showText(
                        "Employee Analytics Report");

                content.endText();

                y -= 40;

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Generated At: "
                                + LocalDateTime.now());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Employee ID: "
                                + analytics.getEmployeeId());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Employee Name: "
                                + safe(
                                        analytics
                                                .getEmployeeName()));

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Department: "
                                + safe(
                                        analytics
                                                .getDepartment()));

                y -= 15;

                y = writeLine(
                        content,
                        titleFont,
                        x,
                        y,
                        "Skill Analytics");

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Total Skills: "
                                + analytics
                                        .getTotalSkills());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Average Skill Score: "
                                + String.format(
                                        "%.2f",
                                        analytics
                                                .getAverageSkillScore()));

                y -= 15;

                y = writeLine(
                        content,
                        titleFont,
                        x,
                        y,
                        "Skill Gaps");

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Total Skill Gaps: "
                                + analytics
                                        .getTotalSkillGaps());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "High Gaps: "
                                + analytics
                                        .getHighGaps());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Medium Gaps: "
                                + analytics
                                        .getMediumGaps());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Low Gaps: "
                                + analytics
                                        .getLowGaps());

                y -= 15;

                y = writeLine(
                        content,
                        titleFont,
                        x,
                        y,
                        "Training");

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Total Trainings: "
                                + analytics
                                        .getTotalTrainings());

                y = writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "Completed Trainings: "
                                + analytics
                                        .getCompletedTrainings());

                writeLine(
                        content,
                        normalFont,
                        x,
                        y,
                        "In Progress Trainings: "
                                + analytics
                                        .getInProgressTrainings());
            }

            document.save(
                    outputStream);

            return outputStream
                    .toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate employee PDF",
                    e);
        }
    }

    // =========================================================
    // EMPLOYEE EXCEL EXPORT
    // =========================================================

    public byte[] generateEmployeeExcel(
            Long employeeId) {

        AnalyticsResponse analytics =
                analyticsService
                        .getEmployeeAnalytics(
                                employeeId);

        try (Workbook workbook =
                     new XSSFWorkbook();
             ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            Sheet sheet =
                    workbook.createSheet(
                            "Employee Analytics");

            // -------------------------------------------------
            // TITLE STYLE
            // -------------------------------------------------

            Font titleFont =
                    workbook.createFont();

            titleFont.setBold(true);
            titleFont.setFontHeightInPoints(
                    (short) 16);

            CellStyle titleStyle =
                    workbook.createCellStyle();

            titleStyle.setFont(
                    titleFont);

            // -------------------------------------------------
            // HEADER STYLE
            // -------------------------------------------------

            Font headerFont =
                    workbook.createFont();

            headerFont.setBold(true);

            CellStyle headerStyle =
                    workbook.createCellStyle();

            headerStyle.setFont(
                    headerFont);

            // -------------------------------------------------
            // TITLE
            // -------------------------------------------------

            Row titleRow =
                    sheet.createRow(0);

            Cell titleCell =
                    titleRow.createCell(0);

            titleCell.setCellValue(
                    "Employee Analytics Report");

            titleCell.setCellStyle(
                    titleStyle);

            // -------------------------------------------------
            // BASIC DETAILS
            // -------------------------------------------------

            createExcelRow(
                    sheet,
                    2,
                    "Generated At",
                    LocalDateTime.now()
                            .toString(),
                    headerStyle);

            createExcelRow(
                    sheet,
                    3,
                    "Employee ID",
                    String.valueOf(
                            analytics
                                    .getEmployeeId()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    4,
                    "Employee Name",
                    safe(
                            analytics
                                    .getEmployeeName()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    5,
                    "Department",
                    safe(
                            analytics
                                    .getDepartment()),
                    headerStyle);

            // -------------------------------------------------
            // SKILL ANALYTICS
            // -------------------------------------------------

            Row skillTitleRow =
                    sheet.createRow(7);

            Cell skillTitleCell =
                    skillTitleRow
                            .createCell(0);

            skillTitleCell.setCellValue(
                    "Skill Analytics");

            skillTitleCell.setCellStyle(
                    headerStyle);

            createExcelRow(
                    sheet,
                    8,
                    "Total Skills",
                    String.valueOf(
                            analytics
                                    .getTotalSkills()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    9,
                    "Average Skill Score",
                    String.format(
                            "%.2f",
                            analytics
                                    .getAverageSkillScore()),
                    headerStyle);

            // -------------------------------------------------
            // SKILL GAPS
            // -------------------------------------------------

            Row gapTitleRow =
                    sheet.createRow(11);

            Cell gapTitleCell =
                    gapTitleRow.createCell(0);

            gapTitleCell.setCellValue(
                    "Skill Gaps");

            gapTitleCell.setCellStyle(
                    headerStyle);

            createExcelRow(
                    sheet,
                    12,
                    "Total Skill Gaps",
                    String.valueOf(
                            analytics
                                    .getTotalSkillGaps()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    13,
                    "High Gaps",
                    String.valueOf(
                            analytics
                                    .getHighGaps()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    14,
                    "Medium Gaps",
                    String.valueOf(
                            analytics
                                    .getMediumGaps()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    15,
                    "Low Gaps",
                    String.valueOf(
                            analytics
                                    .getLowGaps()),
                    headerStyle);

            // -------------------------------------------------
            // TRAINING
            // -------------------------------------------------

            Row trainingTitleRow =
                    sheet.createRow(17);

            Cell trainingTitleCell =
                    trainingTitleRow
                            .createCell(0);

            trainingTitleCell.setCellValue(
                    "Training");

            trainingTitleCell.setCellStyle(
                    headerStyle);

            createExcelRow(
                    sheet,
                    18,
                    "Total Trainings",
                    String.valueOf(
                            analytics
                                    .getTotalTrainings()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    19,
                    "Completed Trainings",
                    String.valueOf(
                            analytics
                                    .getCompletedTrainings()),
                    headerStyle);

            createExcelRow(
                    sheet,
                    20,
                    "In Progress Trainings",
                    String.valueOf(
                            analytics
                                    .getInProgressTrainings()),
                    headerStyle);

            // -------------------------------------------------
            // AUTO SIZE
            // -------------------------------------------------

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(
                    outputStream);

            return outputStream
                    .toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate employee Excel report",
                    e);
        }
    }

    // =========================================================
    // HELPER - WRITE EXCEL ROW
    // =========================================================

    private void createExcelRow(
            Sheet sheet,
            int rowNumber,
            String label,
            String value,
            CellStyle labelStyle) {

        Row row =
                sheet.createRow(
                        rowNumber);

        Cell labelCell =
                row.createCell(0);

        labelCell.setCellValue(
                label);

        labelCell.setCellStyle(
                labelStyle);

        Cell valueCell =
                row.createCell(1);

        valueCell.setCellValue(
                value == null
                        ? ""
                        : value);
    }

    // =========================================================
    // HELPER - WRITE PDF LINE
    // =========================================================

    private float writeLine(
            PDPageContentStream content,
            PDType1Font font,
            float x,
            float y,
            String text)
            throws Exception {

        content.beginText();

        content.setFont(
                font,
                12);

        content.newLineAtOffset(
                x,
                y);

        content.showText(
                text == null
                        ? ""
                        : text);

        content.endText();

        return y - 22;
    }

    private String safe(
            String value) {

        return value == null
                ? ""
                : value;
    }
}