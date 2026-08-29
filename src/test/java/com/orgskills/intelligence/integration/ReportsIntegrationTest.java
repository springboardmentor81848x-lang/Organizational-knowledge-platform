package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.SkillGapReportRow;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AssessmentService;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.TrainingProgressService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The acceptance criterion for the reports: each opens correctly in both formats, and the numbers
 * inside match what the corresponding analytics endpoint currently returns.
 *
 * <p>"Opens correctly" is checked by actually parsing the bytes — the PDF through a PDF reader and
 * the spreadsheet through a workbook reader — rather than by trusting the content type header.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class ReportsIntegrationTest {

    private static final String DEPARTMENT = "Reports Test Department";
    private static final String JOB_TITLE = "Reports Test Engineer";
    private static final String EXCEL_CONTENT_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private TrainingProgressService trainingProgressService;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private RoleCompetencyRepository roleCompetencyRepository;

    @Autowired
    private CourseRepository courseRepository;

    private User employee;
    private User manager;
    private User hrAdmin;
    private Skill ansible;
    private Course ansibleCourse;

    @BeforeEach
    void setUp() {
        ansible = skillRepository.save(skill("Ansible (reports test)", "Platform"));

        manager = userRepository.save(member("reports.manager@orgskills.com", "Reports Manager", Role.MANAGER, null));
        employee = userRepository.save(
                member("reports.employee@orgskills.com", "Reports Employee", Role.EMPLOYEE, manager));

        User hr = base("reports.hr@orgskills.com", "Reports HR", Role.HR_ADMIN);
        hr.setDepartment("People Operations");
        hr.setJobTitle("HR Administrator");
        hrAdmin = userRepository.save(hr);

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(JOB_TITLE);
        competency.setDepartment(DEPARTMENT);
        competency.setSkill(ansible);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(employee);
        userSkill.setSkill(ansible);
        userSkill.setProficiencyLevel(ProficiencyLevel.BEGINNER);
        userSkill.setRatingScore((double) ProficiencyLevel.BEGINNER.getScore());
        userSkillRepository.save(userSkill);

        Course course = new Course();
        course.setTitle("Ansible Essentials (reports test)");
        course.setProvider("Internal Academy");
        course.setSkillCovered(ansible);
        course.setDifficulty("INTERMEDIATE");
        course.setDurationHours(6.0);
        course.setIsInternal(true);
        ansibleCourse = courseRepository.save(course);

        // Give every report something real to describe.
        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(ansibleCourse.getId()));
        trainingProgressService.updateProgress(
                employee.getId(), enrollment.getEnrollmentId(), new UpdateProgressRequest(75.0));
        submitManagerAssessment(ProficiencyLevel.ADVANCED);
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    // ── Employee Learning Report ────────────────────────────────────────────────

    @Test
    @DisplayName("The employee report opens as a PDF and carries the analytics figures")
    void employeeReportPdf() throws Exception {
        EmployeeAnalyticsResponse analytics = readJson(
                authedGet("/api/analytics/employee/" + employee.getId(), employee.getId()),
                EmployeeAnalyticsResponse.class);

        MvcResult result = mockMvc.perform(
                        authedGet("/api/reports/employee/" + employee.getId() + "?format=pdf", employee.getId()))
                .andExpect(status().isOk())
                .andReturn();

        byte[] pdf = result.getResponse().getContentAsByteArray();
        assertThat(result.getResponse().getContentType()).isEqualTo("application/pdf");
        assertThat(result.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION))
                .isEqualTo("attachment; filename=Employee_Learning_Report_" + employee.getId() + ".pdf");

        String text = pdfText(pdf);
        assertThat(text).contains("Employee Learning Report", "Reports Employee", DEPARTMENT);
        assertThat(text).contains(trimNumber(analytics.getLearningProgressPercent()));
        assertThat(text).contains(String.valueOf(analytics.getCompletedEnrollments()));
        assertThat(text).contains(ansible.getName());
        // The assessment moved BEGINNER -> ADVANCED, which the report shows as a signed delta.
        assertThat(text).contains("ADVANCED", "+2");
    }

    @Test
    @DisplayName("The employee report opens as a workbook whose figures match the analytics endpoint")
    void employeeReportExcelMatchesAnalytics() throws Exception {
        EmployeeAnalyticsResponse analytics = readJson(
                authedGet("/api/analytics/employee/" + employee.getId(), employee.getId()),
                EmployeeAnalyticsResponse.class);

        MvcResult result = mockMvc.perform(
                        authedGet("/api/reports/employee/" + employee.getId() + "?format=excel", employee.getId()))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getContentType()).isEqualTo(EXCEL_CONTENT_TYPE);
        assertThat(result.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION))
                .endsWith(".xlsx");

        byte[] workbookBytes = result.getResponse().getContentAsByteArray();
        Map<String, String> figures = readFigures(workbookBytes, "Employee Details");

        assertThat(figures.get("Name")).isEqualTo(analytics.getFullName());
        assertThat(figures.get("Department")).isEqualTo(analytics.getDepartment());
        assertThat(figures.get("Learning Progress %"))
                .isEqualTo(trimNumber(analytics.getLearningProgressPercent()));
        assertThat(figures.get("Overall Readiness %"))
                .isEqualTo(trimNumber(analytics.getGapSummary().getOverallReadinessPercentage()));
        assertThat(figures.get("Training Enrolled (active)"))
                .isEqualTo(String.valueOf(analytics.getActiveEnrollments()));
        assertThat(figures.get("Training Completed"))
                .isEqualTo(String.valueOf(analytics.getCompletedEnrollments()));

        assertThat(sheetNames(workbookBytes)).contains(
                "Employee Details", "Skill Profile", "Current vs Required Proficiency",
                "Assessment Scores", "Skill Improvement", "Remaining Gaps");
    }

    // ── Department Training Report ──────────────────────────────────────────────

    @Test
    @DisplayName("The department report matches the department analytics endpoint in both formats")
    void departmentReportMatchesAnalytics() throws Exception {
        DepartmentAnalyticsResponse analytics = readJson(
                authedGet("/api/analytics/department/" + DEPARTMENT, hrAdmin.getId()),
                DepartmentAnalyticsResponse.class);

        byte[] pdf = reportBytes("/api/reports/department/" + DEPARTMENT + "?format=pdf",
                hrAdmin.getId(), "application/pdf");
        String text = pdfText(pdf);
        assertThat(text).contains("Department Training Report", DEPARTMENT);
        assertThat(text).contains(String.valueOf(analytics.getTotalEmployees()));
        assertThat(text).contains(trimNumber(analytics.getTrainingCompletionRatePercent()));

        byte[] excel = reportBytes("/api/reports/department/" + DEPARTMENT + "?format=excel",
                hrAdmin.getId(), EXCEL_CONTENT_TYPE);
        Map<String, String> figures = readFigures(excel, "Training Summary");

        assertThat(figures.get("Total Employees")).isEqualTo(String.valueOf(analytics.getTotalEmployees()));
        assertThat(figures.get("Eligible Employees (with an open gap)"))
                .isEqualTo(String.valueOf(analytics.getEligibleEmployees()));
        assertThat(figures.get("Employees Enrolled")).isEqualTo(String.valueOf(analytics.getEmployeesEnrolled()));
        assertThat(figures.get("Employees Completed")).isEqualTo(String.valueOf(analytics.getEmployeesCompleted()));
        assertThat(figures.get("Completion %"))
                .isEqualTo(trimNumber(analytics.getTrainingCompletionRatePercent()));
        assertThat(figures.get("Average Progress %"))
                .isEqualTo(trimNumber(analytics.getAverageLearningProgressPercent()));
        assertThat(figures.get("Average Skill Improvement"))
                .isEqualTo(trimNumber(analytics.getAverageSkillImprovement()));
        assertThat(figures.get("Critical Skill Gaps"))
                .isEqualTo(String.valueOf(analytics.getCriticalSkillGapCount()));
    }

    // ── Skill Gap Report ────────────────────────────────────────────────────────

    @Test
    @DisplayName("The skill gap report matches the skill gap analytics endpoint in both formats")
    void skillGapReportMatchesAnalytics() throws Exception {
        List<SkillGapReportRow> analytics = readJsonList(
                authedGet("/api/analytics/skill-gaps", hrAdmin.getId()), SkillGapReportRow.class);
        SkillGapReportRow ansibleRow = analytics.stream()
                .filter(r -> r.getSkillId().equals(ansible.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Skill gap analytics did not include the assessed skill"));

        byte[] pdf = reportBytes("/api/reports/training-effectiveness?format=pdf",
                hrAdmin.getId(), "application/pdf");
        String text = pdfText(pdf);
        assertThat(text).contains("Skill Gap Report", ansible.getName());
        assertThat(text).contains(ansibleRow.getSeverity().name());
        assertThat(text).contains(ansibleRow.getRequiredLevel().name());

        byte[] excel = reportBytes("/api/reports/training-effectiveness?format=excel",
                hrAdmin.getId(), EXCEL_CONTENT_TYPE);
        List<List<String>> rows = readTable(excel, "Gap By Skill");
        List<String> row = rows.stream()
                .filter(r -> !r.isEmpty() && ansible.getName().equals(r.get(0)))
                .findFirst()
                .orElseThrow(() -> new AssertionError("The skill gap sheet did not include the assessed skill"));

        assertThat(row.get(2)).isEqualTo(ansibleRow.getRequiredLevel().name());
        assertThat(row.get(3)).isEqualTo(ansibleRow.getCurrentAverageLevel().name());
        assertThat(row.get(4)).isEqualTo(trimNumber(ansibleRow.getAverageGapScore()));
        assertThat(row.get(5)).isEqualTo(String.valueOf(ansibleRow.getAffectedEmployees()));
        assertThat(row.get(6)).isEqualTo(ansibleRow.getSeverity().name());

        assertThat(sheetNames(excel)).contains("Gap By Skill", "Department Breakdown");
    }

    // ── Format handling and scoping ─────────────────────────────────────────────

    @Test
    @DisplayName("An unrecognised format is rejected rather than silently defaulting")
    void unknownFormatIsRejected() throws Exception {
        mockMvc.perform(authedGet("/api/reports/employee/" + employee.getId() + "?format=csv", employee.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Omitting the format yields a PDF")
    void defaultFormatIsPdf() throws Exception {
        MvcResult result = mockMvc.perform(
                        authedGet("/api/reports/employee/" + employee.getId(), employee.getId()))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getContentType()).isEqualTo("application/pdf");
        assertThat(pdfText(result.getResponse().getContentAsByteArray()))
                .contains("Employee Learning Report");
    }

    @Test
    @DisplayName("A report cannot disclose more than the dashboard the same caller could open")
    void reportsAreScopedLikeTheDashboards() throws Exception {
        User outsider = userRepository.save(outsider());

        mockMvc.perform(authedGet("/api/reports/employee/" + outsider.getId(), manager.getId()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(authedGet("/api/reports/training-effectiveness", employee.getId()))
                .andExpect(status().isUnauthorized());
    }

    // ── Document parsing ────────────────────────────────────────────────────────

    private String pdfText(byte[] pdf) throws Exception {
        assertThat(new String(pdf, 0, 5, StandardCharsets.ISO_8859_1))
                .as("PDF magic bytes")
                .isEqualTo("%PDF-");

        PdfReader reader = new PdfReader(pdf);
        try {
            PdfTextExtractor extractor = new PdfTextExtractor(reader);
            StringBuilder text = new StringBuilder();
            for (int page = 1; page <= reader.getNumberOfPages(); page++) {
                text.append(extractor.getTextFromPage(page)).append('\n');
            }
            return text.toString();
        } finally {
            reader.close();
        }
    }

    private Map<String, String> readFigures(byte[] excel, String sheetName) throws Exception {
        Map<String, String> figures = new LinkedHashMap<>();
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            Sheet sheet = workbook.getSheet(sheetName);
            assertThat(sheet).as("sheet " + sheetName).isNotNull();
            for (Row row : sheet) {
                if (row.getPhysicalNumberOfCells() < 2) {
                    continue;
                }
                String label = cellText(row.getCell(0));
                String value = cellText(row.getCell(1));
                if (!label.isBlank() && !value.isBlank()) {
                    figures.putIfAbsent(label, value);
                }
            }
        }
        return figures;
    }

    private List<List<String>> readTable(byte[] excel, String sheetName) throws Exception {
        List<List<String>> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            Sheet sheet = workbook.getSheet(sheetName);
            assertThat(sheet).as("sheet " + sheetName).isNotNull();
            for (Row row : sheet) {
                List<String> cells = new ArrayList<>();
                for (int i = 0; i < row.getLastCellNum(); i++) {
                    cells.add(cellText(row.getCell(i)));
                }
                rows.add(cells);
            }
        }
        return rows;
    }

    private List<String> sheetNames(byte[] excel) throws Exception {
        List<String> names = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excel))) {
            workbook.forEach(sheet -> names.add(sheet.getSheetName()));
        }
        return names;
    }

    /** Renders a cell the way the assertions expect: numbers without a trailing ".0". */
    private String cellText(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> trimNumber(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> cell.getStringCellValue();
        };
    }

    /** 75.0 reads as "75" and 28.57 as "28.57", matching how the renderers write them. */
    private String trimNumber(Number value) {
        if (value == null) {
            return "-";
        }
        double d = value.doubleValue();
        return d == Math.rint(d) ? String.valueOf((long) d) : String.valueOf(d);
    }

    // ── HTTP helpers ────────────────────────────────────────────────────────────

    private byte[] reportBytes(String url, Long actorId, String expectedContentType) throws Exception {
        MvcResult result = mockMvc.perform(authedGet(url, actorId))
                .andExpect(status().isOk())
                .andReturn();
        assertThat(result.getResponse().getContentType()).isEqualTo(expectedContentType);
        return result.getResponse().getContentAsByteArray();
    }

    private <T> T readJson(MockHttpServletRequestBuilder request, Class<T> type) throws Exception {
        return objectMapper.readValue(jsonBody(request), type);
    }

    private <T> List<T> readJsonList(MockHttpServletRequestBuilder request, Class<T> type) throws Exception {
        return objectMapper.readValue(jsonBody(request),
                objectMapper.getTypeFactory().constructCollectionType(List.class, type));
    }

    private String jsonBody(MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    /**
     * Filters are disabled here, so nothing populates the SecurityContext that method security
     * reads, nor the request principal the controllers resolve their Authentication from.
     */
    private MockHttpServletRequestBuilder authedGet(String url, Long userId) {
        Authentication authentication = principal(userId);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return get(url).principal(authentication);
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private void submitManagerAssessment(ProficiencyLevel level) {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(ansible.getId()));
        AssessmentResponse scheduled = assessmentService.createAssessment(manager.getId(), create);

        SubmitAssessmentRequest submit = new SubmitAssessmentRequest();
        submit.setResults(List.of(new AssessmentResultRequest(ansible.getId(), level)));
        assessmentService.submitAssessment(manager.getId(), scheduled.getAssessmentId(), submit);
    }

    private Skill skill(String name, String category) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(category);
        return skill;
    }

    private User member(String email, String fullName, Role role, User reportsTo) {
        User user = base(email, fullName, role);
        user.setDepartment(DEPARTMENT);
        user.setJobTitle(JOB_TITLE);
        user.setManager(reportsTo);
        return user;
    }

    private User outsider() {
        User user = base("reports.outsider@orgskills.com", "Reports Outsider", Role.EMPLOYEE);
        user.setDepartment("Some Other Department");
        user.setJobTitle("Unrelated Role");
        return user;
    }

    private User base(String email, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "reports@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
