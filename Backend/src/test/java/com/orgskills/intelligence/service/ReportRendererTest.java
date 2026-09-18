package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.report.ReportDocument;
import com.orgskills.intelligence.dto.report.ReportFormat;
import com.orgskills.intelligence.exception.ValidationException;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ReportRendererTest {

    private final ReportRenderer renderer = new ReportRenderer();

    @Test
    @DisplayName("The PDF renderer produces a document a PDF reader recognises")
    void pdfHasValidHeader() throws Exception {
        byte[] pdf = renderer.render(sampleDocument(), ReportFormat.PDF);

        assertThat(new String(pdf, 0, 5, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF-");
        assertThat(pdf.length).isGreaterThan(500);
    }

    @Test
    @DisplayName("Each section becomes its own worksheet")
    void excelWritesOneSheetPerSection() throws Exception {
        byte[] excel = renderer.render(sampleDocument(), ReportFormat.EXCEL);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            assertThat(workbook.getNumberOfSheets()).isEqualTo(2);
            assertThat(workbook.getSheetAt(0).getSheetName()).isEqualTo("Summary");
            assertThat(workbook.getSheetAt(1).getSheetName()).isEqualTo("Detail");
        }
    }

    @Test
    @DisplayName("Numbers are written as numbers so a spreadsheet can total them")
    void excelWritesNumbersAsNumbers() throws Exception {
        byte[] excel = renderer.render(sampleDocument(), ReportFormat.EXCEL);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            Sheet detail = workbook.getSheet("Detail");
            // Row 0 is the title, 1 the subtitle, 2 blank, 3 the column headers, 4 the first row.
            assertThat(detail.getRow(4).getCell(0).getCellType()).isEqualTo(CellType.STRING);
            assertThat(detail.getRow(4).getCell(1).getCellType()).isEqualTo(CellType.NUMERIC);
            assertThat(detail.getRow(4).getCell(1).getNumericCellValue()).isEqualTo(2.5);
        }
    }

    @Test
    @DisplayName("An empty table prints its explanation instead of a blank space")
    void emptyTableExplainsItself() throws Exception {
        ReportDocument document = new ReportDocument("Empty", "none", "Empty");
        document.section("Detail")
                .columns("Skill", "Gap")
                .emptyMessage("Nothing has been analysed yet.");

        byte[] excel = renderer.render(document, ReportFormat.EXCEL);
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            Sheet detail = workbook.getSheet("Detail");
            assertThat(detail.getRow(4).getCell(0).getStringCellValue())
                    .isEqualTo("Nothing has been analysed yet.");
        }
    }

    @Test
    @DisplayName("Sheet names are truncated and de-duplicated to stay valid in Excel")
    void sheetNamesStayValid() throws Exception {
        ReportDocument document = new ReportDocument("Long headings", "none", "Long");
        document.section("A very long section heading that Excel will not accept as is").figure("x", 1);
        document.section("A very long section heading that Excel will not accept either").figure("x", 2);

        byte[] excel = renderer.render(document, ReportFormat.EXCEL);
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            assertThat(workbook.getNumberOfSheets()).isEqualTo(2);
            assertThat(workbook.getSheetAt(0).getSheetName()).hasSizeLessThanOrEqualTo(31);
            assertThat(workbook.getSheetAt(1).getSheetName()).hasSizeLessThanOrEqualTo(31);
            assertThat(workbook.getSheetAt(0).getSheetName())
                    .isNotEqualTo(workbook.getSheetAt(1).getSheetName());
        }
    }

    @Test
    @DisplayName("The format parameter accepts both spellings and rejects anything else")
    void formatParsing() {
        assertThat(ReportFormat.from(null)).isEqualTo(ReportFormat.PDF);
        assertThat(ReportFormat.from("PDF")).isEqualTo(ReportFormat.PDF);
        assertThat(ReportFormat.from("excel")).isEqualTo(ReportFormat.EXCEL);
        assertThat(ReportFormat.from("xlsx")).isEqualTo(ReportFormat.EXCEL);

        assertThatThrownBy(() -> ReportFormat.from("csv"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Unsupported report format");
    }

    private ReportDocument sampleDocument() {
        ReportDocument document = new ReportDocument("Sample Report", "generated for a test", "Sample");
        document.section("Summary")
                .figure("Total Employees", 12)
                .figure("Completion %", 47.25);
        document.section("Detail")
                .columns("Skill", "Gap")
                .row("Terraform", 2.5)
                .row("Kubernetes", 1.0);
        return document;
    }
}
