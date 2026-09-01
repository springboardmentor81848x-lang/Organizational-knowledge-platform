package com.knowledgegap.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.knowledgegap.service.ReportService;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/reports")
@AllArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // ============================================================
    // GET REPORT DATA
    // ============================================================

    @GetMapping("/employee")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeReport() {
        return ResponseEntity.ok(reportService.getEmployeeReport());
    }

    @GetMapping("/department")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentReport() {
        return ResponseEntity.ok(reportService.getDepartmentReport());
    }

    @GetMapping("/training-effectiveness")
    public ResponseEntity<List<Map<String, Object>>> getTrainingEffectivenessReport() {
        return ResponseEntity.ok(reportService.getTrainingEffectivenessReport());
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getReportStatistics() {
        return ResponseEntity.ok(reportService.getReportStatistics());
    }

    // ============================================================
    // EXPORT TO EXCEL
    // ============================================================

    @GetMapping("/export/employee/excel")
    public ResponseEntity<byte[]> exportEmployeeReportToExcel() throws Exception {
        List<Map<String, Object>> data = reportService.getEmployeeReport();
        byte[] excelContent = generateExcelReport("Employee Report", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "employee_report_" + System.currentTimeMillis() + ".xlsx");

        return ResponseEntity.ok().headers(headers).body(excelContent);
    }

    @GetMapping("/export/department/excel")
    public ResponseEntity<byte[]> exportDepartmentReportToExcel() throws Exception {
        List<Map<String, Object>> data = reportService.getDepartmentReport();
        byte[] excelContent = generateExcelReport("Department Report", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "department_report_" + System.currentTimeMillis() + ".xlsx");

        return ResponseEntity.ok().headers(headers).body(excelContent);
    }

    @GetMapping("/export/training-effectiveness/excel")
    public ResponseEntity<byte[]> exportTrainingEffectivenessReportToExcel() throws Exception {
        List<Map<String, Object>> data = reportService.getTrainingEffectivenessReport();
        byte[] excelContent = generateExcelReport("Training Effectiveness Report", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "training_effectiveness_report_" + System.currentTimeMillis() + ".xlsx");

        return ResponseEntity.ok().headers(headers).body(excelContent);
    }

    // ============================================================
    // EXPORT TO PDF
    // ============================================================

    @GetMapping("/export/employee/pdf")
    public ResponseEntity<byte[]> exportEmployeeReportToPdf() throws Exception {
        List<Map<String, Object>> data = reportService.getEmployeeReport();
        byte[] pdfContent = generatePdfReport("Employee Report", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "employee_report_" + System.currentTimeMillis() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfContent);
    }

    @GetMapping("/export/department/pdf")
    public ResponseEntity<byte[]> exportDepartmentReportToPdf() throws Exception {
        List<Map<String, Object>> data = reportService.getDepartmentReport();
        byte[] pdfContent = generatePdfReport("Department Report", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "department_report_" + System.currentTimeMillis() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfContent);
    }

    @GetMapping("/export/training-effectiveness/pdf")
    public ResponseEntity<byte[]> exportTrainingEffectivenessReportToPdf() throws Exception {
        List<Map<String, Object>> data = reportService.getTrainingEffectivenessReport();
        byte[] pdfContent = generatePdfReport("Training Effectiveness Report", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "training_effectiveness_report_" + System.currentTimeMillis() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfContent);
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private byte[] generateExcelReport(String reportTitle, List<Map<String, Object>> data) throws Exception {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(reportTitle);

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Write report title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(reportTitle);
            titleCell.setCellStyle(headerStyle);

            // Write generated date
            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            // Write headers
            if (!data.isEmpty()) {
                Map<String, Object> firstRow = data.get(0);
                Row headerRow = sheet.createRow(3);

                int colIndex = 0;
                for (String key : firstRow.keySet()) {
                    Cell cell = headerRow.createCell(colIndex++);
                    cell.setCellValue(key);
                    cell.setCellStyle(headerStyle);
                }

                // Write data
                int rowIndex = 4;
                for (Map<String, Object> record : data) {
                    Row row = sheet.createRow(rowIndex++);
                    int colIdx = 0;
                    for (Object value : record.values()) {
                        row.createCell(colIdx++).setCellValue(value != null ? value.toString() : "");
                    }
                }

                // Auto-size columns
                for (int i = 0; i < firstRow.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private byte[] generatePdfReport(String reportTitle, List<Map<String, Object>> data) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Add title
        Paragraph title = new Paragraph(reportTitle);
        title.setFont(new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD));
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Add date
        Paragraph date = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        date.setFont(new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10));
        date.setAlignment(Element.ALIGN_CENTER);
        document.add(date);

        document.add(new Paragraph("\n")); // Space

        // Create table
        if (!data.isEmpty()) {
            Map<String, Object> firstRow = data.get(0);
            int columnCount = firstRow.size();

            PdfPTable table = new PdfPTable(columnCount);
            table.setWidthPercentage(100);

            // Add header cells
            for (String key : firstRow.keySet()) {
                PdfPCell headerCell = new PdfPCell(new Phrase(key));
                headerCell.setBackgroundColor(new BaseColor(0, 51, 102)); // Dark blue
                headerCell.setPadding(5);
                Phrase headerPhrase = new Phrase(key);
                headerPhrase.setFont(new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.BOLD, BaseColor.WHITE));
                headerCell.setPhrase(headerPhrase);
                table.addCell(headerCell);
            }

            // Add data rows
            for (Map<String, Object> record : data) {
                for (Object value : record.values()) {
                    PdfPCell cell = new PdfPCell(new Phrase(value != null ? value.toString() : ""));
                    cell.setPadding(5);
                    table.addCell(cell);
                }
            }

            document.add(table);
        }

        document.close();
        return outputStream.toByteArray();
    }
}
