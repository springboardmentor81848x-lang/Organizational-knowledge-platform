package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.report.ReportFormat;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.AnalyticsReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReportController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class ReportControllerTest {

    private static final String EXCEL_CONTENT_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsReportService analyticsReportService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("GET /api/reports/employee/{id} defaults to PDF and sets a download filename")
    void employeeReportDefaultsToPdf() throws Exception {
        when(analyticsReportService.employeeLearningReport(1L, 1L, ReportFormat.PDF))
                .thenReturn(report("Employee_Learning_Report_1.pdf", "application/pdf"));

        mockMvc.perform(get("/api/reports/employee/1").principal(principal(1L)))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=Employee_Learning_Report_1.pdf"));
    }

    @Test
    @DisplayName("GET /api/reports/employee/{id}?format=excel returns a spreadsheet")
    void employeeReportExcel() throws Exception {
        when(analyticsReportService.employeeLearningReport(1L, 1L, ReportFormat.EXCEL))
                .thenReturn(report("Employee_Learning_Report_1.xlsx", EXCEL_CONTENT_TYPE));

        mockMvc.perform(get("/api/reports/employee/1").principal(principal(1L)).param("format", "excel"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(EXCEL_CONTENT_TYPE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=Employee_Learning_Report_1.xlsx"));
    }

    @Test
    @DisplayName("The xlsx spelling of the format is accepted alongside excel")
    void xlsxIsAcceptedAsExcel() throws Exception {
        when(analyticsReportService.employeeLearningReport(1L, 1L, ReportFormat.EXCEL))
                .thenReturn(report("Employee_Learning_Report_1.xlsx", EXCEL_CONTENT_TYPE));

        mockMvc.perform(get("/api/reports/employee/1").principal(principal(1L)).param("format", "xlsx"))
                .andExpect(status().isOk());

        verify(analyticsReportService).employeeLearningReport(1L, 1L, ReportFormat.EXCEL);
    }

    @Test
    @DisplayName("An unsupported format is a 400 rather than a silent fallback")
    void unsupportedFormatIsRejected() throws Exception {
        mockMvc.perform(get("/api/reports/employee/1").principal(principal(1L)).param("format", "csv"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/reports/department/{id} passes the department name through")
    void departmentReport() throws Exception {
        when(analyticsReportService.departmentTrainingReport(eq(3L), eq("Engineering"), eq(ReportFormat.EXCEL)))
                .thenReturn(report("Department_Training_Report_Engineering.xlsx", EXCEL_CONTENT_TYPE));

        mockMvc.perform(get("/api/reports/department/Engineering").principal(principal(3L))
                        .param("format", "excel"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=Department_Training_Report_Engineering.xlsx"));

        verify(analyticsReportService).departmentTrainingReport(3L, "Engineering", ReportFormat.EXCEL);
    }

    @Test
    @DisplayName("GET /api/reports/training-effectiveness returns the skill gap report")
    void skillGapReport() throws Exception {
        when(analyticsReportService.skillGapReport(4L, ReportFormat.PDF))
                .thenReturn(report("Skill_Gap_Report.pdf", "application/pdf"));

        mockMvc.perform(get("/api/reports/training-effectiveness").principal(principal(4L)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=Skill_Gap_Report.pdf"));
    }

    @Test
    @DisplayName("A report refused by the analytics layer surfaces as 401")
    void refusedReportSurfacesAsUnauthorized() throws Exception {
        when(analyticsReportService.skillGapReport(1L, ReportFormat.PDF))
                .thenThrow(new UnauthorizedException("Skill gap analytics require an HR, L&D or admin role"));

        mockMvc.perform(get("/api/reports/training-effectiveness").principal(principal(1L)))
                .andExpect(status().isUnauthorized());
    }

    private AnalyticsReportService.RenderedReport report(String filename, String contentType) {
        return new AnalyticsReportService.RenderedReport(
                "report-bytes".getBytes(StandardCharsets.UTF_8), filename, contentType);
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "user@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
