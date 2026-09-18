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
            titleRow.createCell(0).setCellValue("ORGANIZATIONAL SKILL GAP SUMMARY REPORT - " + text(data.getScopeName()));
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
                writeText(row.createCell(0), cellData.getSkillName());
                writeText(row.createCell(1), cellData.getCategory());
                setIfMeasured(row.createCell(2), cellData.getTotalGaps());
                setIfMeasured(row.createCell(3), cellData.getLowCount());
                setIfMeasured(row.createCell(4), cellData.getMediumCount());
                setIfMeasured(row.createCell(5), cellData.getHighCount());
                setIfMeasured(row.createCell(6), cellData.getCriticalCount());
                setIfMeasured(row.createCell(7), cellData.getAvgGapScore());
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
                writeText(row.createCell(0), item.getCourseTitle());
                writeText(row.createCell(1), item.getProvider());
                writeText(row.createCell(2), item.getSkillName());
                setIfMeasured(row.createCell(3), item.getEnrolledCount());
                setIfMeasured(row.createCell(4), item.getCompletedCount());
                setIfMeasured(row.createCell(5), item.getCompletionRatePercent());
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
                writeText(row.createCell(0), item.getSkillName());
                writeText(row.createCell(1), item.getCategory());
                setIfMeasured(row.createCell(2), item.getHeadcount());
                setIfMeasured(row.createCell(3), item.getAverageProficiency());
                writeText(row.createCell(4), item.getAverageProficiencyLabel());
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

            document.add(new Paragraph("Skill Gap Summary Report - " + text(data.getScopeName()), titleFont));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + " | Scope Employees: " + text(data.getTotalEmployees()), subFont));
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
                table.addCell(text(cellData.getSkillName()));
                table.addCell(text(cellData.getCategory()));
                table.addCell(text(cellData.getTotalGaps()));
                table.addCell(text(cellData.getLowCount()));
                table.addCell(text(cellData.getMediumCount()));
                table.addCell(text(cellData.getHighCount()));
                table.addCell(text(cellData.getCriticalCount()));
                table.addCell(text(cellData.getAvgGapScore()));
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
                table.addCell(text(item.getCourseTitle()));
                table.addCell(text(item.getProvider()));
                table.addCell(item.getSkillName() != null ? item.getSkillName() : "No skill mapped");
                table.addCell(text(item.getEnrolledCount()));
                table.addCell(text(item.getCompletedCount()));
                table.addCell(item.getCompletionRatePercent() == null
                        ? PLACEHOLDER : item.getCompletionRatePercent() + "%");
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
                table.addCell(text(item.getSkillName()));
                table.addCell(item.getCategory());
                table.addCell(text(item.getHeadcount()));
                table.addCell(text(item.getAverageProficiency()));
                table.addCell(text(item.getAverageProficiencyLabel()));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate Workforce Planning PDF: {}", ex.getMessage(), ex);
            throw new RuntimeException("PDF generation failed", ex);
        }
    }

    /**
     * What a cell shows when the underlying figure is absent.
     *
     * <p>A dash rather than a blank: an empty cell reads as a report that forgot the value,
     * whereas a dash says the platform has none to give - which for an uncategorised skill, or a
     * course with no provider recorded, is the truth.
     */
    private static final String PLACEHOLDER = "-";

    /**
     * Renders one value for a PDF table cell.
     *
     * <p>Every column these reports draw on is nullable: a skill need not carry a category, a
     * course need not name a provider, and the aggregate counts stay null until a gap analysis
     * has run. {@code String.valueOf(null)} does not fail loudly - it writes the four letters
     * "null" into the document - so reports were being handed to people with "null" printed
     * across them. Routing every cell through here is what stops that.
     */
    private static String text(Object value) {
        if (value == null) {
            return PLACEHOLDER;
        }
        String rendered = String.valueOf(value);
        return rendered.isBlank() ? PLACEHOLDER : rendered;
    }

    /** Writes a nullable string; POI has no null-safe setter of its own. */
    private void writeText(Cell cell, String value) {
        cell.setCellValue(value == null ? PLACEHOLDER : value);
    }

    /**
     * Leaves the cell empty when the figure has not been measured, rather than writing a zero.
     *
     * <p>Widened from Double to Number so the counts pass through it too. They were written with
     * {@code setCellValue(item.getCount())}, and because POI only takes a primitive double, a
     * count that was still null unboxed and threw - failing the whole spreadsheet download over
     * a single unmeasured row.
     */
    private void setIfMeasured(Cell cell, Number value) {
        if (value != null) {
            cell.setCellValue(value.doubleValue());
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
