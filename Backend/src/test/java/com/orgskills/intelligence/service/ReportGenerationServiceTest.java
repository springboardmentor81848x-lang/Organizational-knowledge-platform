package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.hr.SkillInventoryResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapCell;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * The HR downloads, exercised against the data they actually meet.
 *
 * <p>Every field these reports read is nullable — a skill need not have a category, a course need
 * not name a provider, and the aggregate counts stay null until a gap analysis has run. The two
 * formats failed differently on that: the spreadsheet threw, because POI's setter takes a
 * primitive and a null count unboxed; the PDF did not throw at all, which was worse, because it
 * quietly printed the four letters "null" into a document somebody was about to circulate.
 */
class ReportGenerationServiceTest {

    private HrIntelligenceService hrIntelligenceService;
    private ReportGenerationService service;

    @BeforeEach
    void setUp() {
        hrIntelligenceService = mock(HrIntelligenceService.class);
        service = new ReportGenerationService(hrIntelligenceService);
    }

    /** A row in which everything optional is absent — the shape that used to break the download. */
    private void stubRowsWithNothingRecorded() {
        when(hrIntelligenceService.getOrgGapIntelligence(any())).thenReturn(new GapHeatmapResponse(
                "ORG", null, null,
                List.of(new GapHeatmapCell(1L, "Terraform", null, null, null, null, null, null, null)),
                Instant.now()));

        TrainingEffectivenessResponse course = new TrainingEffectivenessResponse();
        course.setCourseId(1L);
        course.setCourseTitle("Terraform Foundations");
        when(hrIntelligenceService.getTrainingEffectiveness()).thenReturn(List.of(course));

        when(hrIntelligenceService.getWorkforceSkillInventory()).thenReturn(
                List.of(new SkillInventoryResponse(1L, "Kubernetes", null, null, null, null)));
    }

    private void stubNoRowsAtAll() {
        when(hrIntelligenceService.getOrgGapIntelligence(any()))
                .thenReturn(new GapHeatmapResponse("ORG", "Organization", 0, List.of(), Instant.now()));
        when(hrIntelligenceService.getTrainingEffectiveness()).thenReturn(List.of());
        when(hrIntelligenceService.getWorkforceSkillInventory()).thenReturn(List.of());
    }

    @Test
    @DisplayName("A spreadsheet still downloads when the counts have not been measured yet")
    void excelSurvivesUnmeasuredCounts() {
        stubRowsWithNothingRecorded();

        assertThatCode(() -> service.generateSkillGapSummaryExcel(null)).doesNotThrowAnyException();
        assertThatCode(service::generateTrainingEffectivenessExcel).doesNotThrowAnyException();
        assertThatCode(service::generateWorkforcePlanningExcel).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("An unmeasured figure leaves its cell blank rather than claiming a zero")
    void excelLeavesUnmeasuredCellsBlank() throws Exception {
        stubRowsWithNothingRecorded();

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(service.generateWorkforcePlanningExcel()))) {
            var row = workbook.getSheetAt(0).getRow(1);
            assertThat(row.getCell(0).getStringCellValue()).isEqualTo("Kubernetes");
            assertThat(row.getCell(2).getCellType())
                    .as("headcount was never measured").isEqualTo(CellType.BLANK);
            assertThat(row.getCell(3).getCellType())
                    .as("average proficiency was never measured").isEqualTo(CellType.BLANK);
        }
    }

    @Test
    @DisplayName("A PDF prints a dash for a missing value, never the word null")
    void pdfNeverPrintsTheWordNull() {
        stubRowsWithNothingRecorded();

        assertThat(asText(service.generateSkillGapSummaryPdf(null))).doesNotContain("null");
        assertThat(asText(service.generateTrainingEffectivenessPdf())).doesNotContain("null");
        assertThat(asText(service.generateWorkforcePlanningPdf())).doesNotContain("null");
    }

    @Test
    @DisplayName("Every report is a readable document even with nothing to report on")
    void emptyReportsStillOpen() throws Exception {
        stubNoRowsAtAll();

        assertThat(service.generateSkillGapSummaryPdf(null)).startsWith(pdfMagic());
        assertThat(service.generateTrainingEffectivenessPdf()).startsWith(pdfMagic());
        assertThat(service.generateWorkforcePlanningPdf()).startsWith(pdfMagic());

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(service.generateSkillGapSummaryExcel(null)))) {
            assertThat(workbook.getNumberOfSheets()).isEqualTo(1);
        }
    }

    private byte[] pdfMagic() {
        return "%PDF-".getBytes(StandardCharsets.ISO_8859_1);
    }

    /**
     * The raw bytes are enough to catch a stray "null": the text this report writes is short
     * enough that OpenPDF stores it uncompressed, and a false pass here would only mean the
     * assertion is weaker than intended, never that a broken document slipped through.
     */
    private String asText(byte[] pdf) {
        return new String(pdf, StandardCharsets.ISO_8859_1);
    }
}
