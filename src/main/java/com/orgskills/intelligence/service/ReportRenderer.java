package com.orgskills.intelligence.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.orgskills.intelligence.dto.report.ReportDocument;
import com.orgskills.intelligence.dto.report.ReportFormat;
import com.orgskills.intelligence.dto.report.ReportSection;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Turns a {@link ReportDocument} into a PDF or a spreadsheet.
 *
 * <p>Both formats are rendered from the same document, so the two downloads of a report cannot
 * show different numbers — a discrepancy between the PDF and the Excel of the same report is the
 * kind of thing nobody notices until it is quoted in a meeting.
 */
@Component
public class ReportRenderer {

    private static final Color ACCENT = new Color(41, 128, 185);
    private static final int MAX_SHEET_NAME_LENGTH = 31;

    public byte[] render(ReportDocument document, ReportFormat format) throws IOException {
        return format == ReportFormat.EXCEL ? renderExcel(document) : renderPdf(document);
    }

    // ── PDF ─────────────────────────────────────────────────────────────────────

    private byte[] renderPdf(ReportDocument document) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document pdf = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
            PdfWriter.getInstance(pdf, out);
            pdf.open();

            pdf.add(new Paragraph(document.getTitle(),
                    new Font(Font.HELVETICA, 18, Font.BOLD, ACCENT)));
            pdf.add(new Paragraph(document.getSubtitle(),
                    new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY)));
            pdf.add(new Paragraph(" "));

            for (ReportSection section : document.getSections()) {
                pdf.add(new Paragraph(section.getHeading(),
                        new Font(Font.HELVETICA, 13, Font.BOLD, Color.DARK_GRAY)));
                pdf.add(new Paragraph(" "));

                if (!section.getFigures().isEmpty()) {
                    pdf.add(figureTable(section.getFigures()));
                }
                if (section.isTable()) {
                    pdf.add(section.getRows().isEmpty()
                            ? new Paragraph(section.getEmptyMessage(),
                                    new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY))
                            : dataTable(section));
                }
                pdf.add(new Paragraph(" "));
            }

            pdf.close();
            return out.toByteArray();
        }
    }

    /** Labelled figures render as a two-column table so values line up down the page. */
    private PdfPTable figureTable(Map<String, String> figures) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.DARK_GRAY);
        Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);

        figures.forEach((label, value) -> {
            table.addCell(new PdfPCell(new Phrase(label, labelFont)));
            table.addCell(new PdfPCell(new Phrase(value, valueFont)));
        });
        return table;
    }

    private PdfPTable dataTable(ReportSection section) {
        List<String> columns = section.getColumns();
        PdfPTable table = new PdfPTable(columns.size());
        table.setWidthPercentage(100);

        Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
        for (String column : columns) {
            PdfPCell cell = new PdfPCell(new Phrase(column, headerFont));
            cell.setBackgroundColor(ACCENT);
            table.addCell(cell);
        }

        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);
        for (List<String> row : section.getRows()) {
            for (String value : row) {
                table.addCell(new PdfPCell(new Phrase(value, cellFont)));
            }
        }
        return table;
    }

    // ── Excel ───────────────────────────────────────────────────────────────────

    private byte[] renderExcel(ReportDocument document) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle headerStyle = headerStyle(workbook);
            CellStyle labelStyle = boldStyle(workbook);

            for (ReportSection section : document.getSections()) {
                Sheet sheet = workbook.createSheet(sheetName(workbook, section.getHeading()));
                int rowIdx = 0;

                Row titleRow = sheet.createRow(rowIdx++);
                titleRow.createCell(0).setCellValue(document.getTitle());
                titleRow.getCell(0).setCellStyle(labelStyle);
                sheet.createRow(rowIdx++).createCell(0).setCellValue(document.getSubtitle());
                rowIdx++;

                for (Map.Entry<String, String> figure : section.getFigures().entrySet()) {
                    Row row = sheet.createRow(rowIdx++);
                    Cell label = row.createCell(0);
                    label.setCellValue(figure.getKey());
                    label.setCellStyle(labelStyle);
                    writeValue(row.createCell(1), figure.getValue());
                }

                if (section.isTable()) {
                    if (!section.getFigures().isEmpty()) {
                        rowIdx++;
                    }
                    Row headerRow = sheet.createRow(rowIdx++);
                    List<String> columns = section.getColumns();
                    for (int i = 0; i < columns.size(); i++) {
                        Cell cell = headerRow.createCell(i);
                        cell.setCellValue(columns.get(i));
                        cell.setCellStyle(headerStyle);
                    }

                    if (section.getRows().isEmpty()) {
                        sheet.createRow(rowIdx++).createCell(0).setCellValue(section.getEmptyMessage());
                    }
                    for (List<String> row : section.getRows()) {
                        Row dataRow = sheet.createRow(rowIdx++);
                        for (int i = 0; i < row.size(); i++) {
                            writeValue(dataRow.createCell(i), row.get(i));
                        }
                    }
                    for (int i = 0; i < columns.size(); i++) {
                        sheet.autoSizeColumn(i);
                    }
                } else {
                    sheet.autoSizeColumn(0);
                    sheet.autoSizeColumn(1);
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Writes numbers as numbers so a spreadsheet can sum and sort them, and everything else as
     * text. A report whose figures arrive as strings is a report nobody can pivot.
     */
    private void writeValue(Cell cell, String value) {
        try {
            cell.setCellValue(Double.parseDouble(value));
        } catch (NumberFormatException notANumber) {
            cell.setCellValue(value);
        }
    }

    /** Excel sheet names are capped at 31 characters and must be unique within a workbook. */
    private String sheetName(Workbook workbook, String heading) {
        String base = heading.replaceAll("[\\\\/*?\\[\\]:]", " ").trim();
        if (base.length() > MAX_SHEET_NAME_LENGTH) {
            base = base.substring(0, MAX_SHEET_NAME_LENGTH);
        }
        String candidate = base;
        int suffix = 2;
        while (workbook.getSheet(candidate) != null) {
            String numbered = " " + suffix++;
            int room = MAX_SHEET_NAME_LENGTH - numbered.length();
            candidate = (base.length() > room ? base.substring(0, room) : base) + numbered;
        }
        return candidate;
    }

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle boldStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}
