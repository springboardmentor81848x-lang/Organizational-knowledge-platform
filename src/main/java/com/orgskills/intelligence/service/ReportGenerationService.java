package com.orgskills.intelligence.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.orgskills.intelligence.dto.hr.SkillInventoryResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapCell;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGenerationService {

    private final HrIntelligenceService hrIntelligenceService;

    // ── Excel Generation ─────────────────────────────────────────────────────────

    public byte[] generateSkillGapSummaryExcel(String department) throws IOException {
        GapHeatmapResponse data = hrIntelligenceService.getOrgGapIntelligence(department);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Skill Gap Summary");

            CellStyle headerStyle = createHeaderStyle(workbook);

            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("ORGANIZATIONAL SKILL GAP SUMMARY REPORT - " + data.getScopeName());
            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("Generated At: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            Row headerRow = sheet.createRow(3);
            String[] headers = {"Skill Name", "Category", "Total Gaps", "Low Risk", "Medium Risk", "High Risk", "Critical Risk", "Avg Gap Score"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 4;
            for (GapHeatmapCell cellData : data.getCells()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(cellData.getSkillName());
                row.createCell(1).setCellValue(cellData.getCategory());
                row.createCell(2).setCellValue(cellData.getTotalGaps());
                row.createCell(3).setCellValue(cellData.getLowCount());
                row.createCell(4).setCellValue(cellData.getMediumCount());
                row.createCell(5).setCellValue(cellData.getHighCount());
                row.createCell(6).setCellValue(cellData.getCriticalCount());
                row.createCell(7).setCellValue(cellData.getAvgGapScore());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] generateTrainingEffectivenessExcel() throws IOException {
        List<TrainingEffectivenessResponse> data = hrIntelligenceService.getTrainingEffectiveness();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Training Effectiveness");
            CellStyle headerStyle = createHeaderStyle(workbook);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Course Title", "Provider", "Skill Covered", "Enrolled", "Completed", "Completion Rate %", "Pre-Course Level", "Post-Course Level", "Avg Improvement"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (TrainingEffectivenessResponse item : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getCourseTitle());
                row.createCell(1).setCellValue(item.getProvider());
                row.createCell(2).setCellValue(item.getSkillName());
                row.createCell(3).setCellValue(item.getEnrolledCount());
                row.createCell(4).setCellValue(item.getCompletedCount());
                row.createCell(5).setCellValue(item.getCompletionRatePercent());
                // A course nobody has finished and been reassessed on has no before/after to
                // report. The cell is left blank rather than filled with a zero, which would
                // read as "no improvement" rather than "not measured".
                setIfMeasured(row.createCell(6), item.getAvgPreCourseSkillLevel());
                setIfMeasured(row.createCell(7), item.getAvgPostCourseSkillLevel());
                setIfMeasured(row.createCell(8), item.getAvgSkillImprovement());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] generateWorkforcePlanningExcel() throws IOException {
        List<SkillInventoryResponse> data = hrIntelligenceService.getWorkforceSkillInventory();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Workforce Skill Inventory");
            CellStyle headerStyle = createHeaderStyle(workbook);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Skill Name", "Category", "Employee Headcount", "Average Proficiency", "Proficiency Label"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (SkillInventoryResponse item : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getSkillName());
                row.createCell(1).setCellValue(item.getCategory());
                row.createCell(2).setCellValue(item.getHeadcount());
                row.createCell(3).setCellValue(item.getAverageProficiency());
                row.createCell(4).setCellValue(item.getAverageProficiencyLabel());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ── PDF Generation ───────────────────────────────────────────────────────────

    public byte[] generateSkillGapSummaryPdf(String department) {
        GapHeatmapResponse data = hrIntelligenceService.getOrgGapIntelligence(department);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(41, 128, 185));
            Font subFont = new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY);

            document.add(new Paragraph("Skill Gap Summary Report - " + data.getScopeName(), titleFont));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + " | Scope Employees: " + data.getTotalEmployees(), subFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);

            String[] headers = {"Skill Name", "Category", "Total Gaps", "Low", "Med", "High", "Critical", "Avg Gap"};
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
                headerCell.setBackgroundColor(new Color(41, 128, 185));
                table.addCell(headerCell);
            }

            for (GapHeatmapCell cellData : data.getCells()) {
                table.addCell(cellData.getSkillName());
                table.addCell(cellData.getCategory());
                table.addCell(String.valueOf(cellData.getTotalGaps()));
                table.addCell(String.valueOf(cellData.getLowCount()));
                table.addCell(String.valueOf(cellData.getMediumCount()));
                table.addCell(String.valueOf(cellData.getHighCount()));
                table.addCell(String.valueOf(cellData.getCriticalCount()));
                table.addCell(String.valueOf(cellData.getAvgGapScore()));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate Skill Gap PDF: {}", ex.getMessage(), ex);
            throw new RuntimeException("PDF generation failed", ex);
        }
    }

    public byte[] generateTrainingEffectivenessPdf() {
        List<TrainingEffectivenessResponse> data = hrIntelligenceService.getTrainingEffectiveness();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(39, 174, 96));
            document.add(new Paragraph("Training Effectiveness Report", titleFont));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);

            String[] headers = {"Course Title", "Provider", "Skill", "Enrolled", "Completed", "Completion Rate %", "Avg Improvement"};
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
                headerCell.setBackgroundColor(new Color(39, 174, 96));
                table.addCell(headerCell);
            }

            for (TrainingEffectivenessResponse item : data) {
                table.addCell(item.getCourseTitle());
                table.addCell(item.getProvider());
                table.addCell(item.getSkillName() != null ? item.getSkillName() : "No skill mapped");
                table.addCell(String.valueOf(item.getEnrolledCount()));
                table.addCell(String.valueOf(item.getCompletedCount()));
                table.addCell(item.getCompletionRatePercent() + "%");
                table.addCell(improvementText(item.getAvgSkillImprovement()));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate Training Effectiveness PDF: {}", ex.getMessage(), ex);
            throw new RuntimeException("PDF generation failed", ex);
        }
    }

    public byte[] generateWorkforcePlanningPdf() {
        List<SkillInventoryResponse> data = hrIntelligenceService.getWorkforceSkillInventory();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(142, 68, 173));
            document.add(new Paragraph("Workforce Skill Planning Report", titleFont));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);

            String[] headers = {"Skill Name", "Category", "Headcount", "Avg Proficiency", "Level"};
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
                headerCell.setBackgroundColor(new Color(142, 68, 173));
                table.addCell(headerCell);
            }

            for (SkillInventoryResponse item : data) {
                table.addCell(item.getSkillName());
                table.addCell(item.getCategory());
                table.addCell(String.valueOf(item.getHeadcount()));
                table.addCell(String.valueOf(item.getAverageProficiency()));
                table.addCell(item.getAverageProficiencyLabel());
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate Workforce Planning PDF: {}", ex.getMessage(), ex);
            throw new RuntimeException("PDF generation failed", ex);
        }
    }

    /** Leaves the cell empty when the figure has not been measured, rather than writing a zero. */
    private void setIfMeasured(Cell cell, Double value) {
        if (value != null) {
            cell.setCellValue(value);
        }
    }

    /** Says so in words when a course has no measured movement yet. */
    private String improvementText(Double improvement) {
        if (improvement == null) {
            return "Not yet measured";
        }
        return (improvement > 0 ? "+" : "") + improvement;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        headerStyle.setFont(font);
        return headerStyle;
    }
}
