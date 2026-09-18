package com.orgskills.intelligence.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.ld.CatalogImportResult;
import com.orgskills.intelligence.dto.ld.ExternalCourseDTO;
import com.orgskills.intelligence.dto.ld.ExternalCourseResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.exception.ExternalProviderException;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.provider.ExternalCourseProvider;
import com.orgskills.intelligence.provider.ManualCatalogProvider;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.util.DifficultyNormalizer;
import com.orgskills.intelligence.util.DurationNormalizer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ExternalCatalogService {

    private final CourseRepository courseRepository;
    private final SkillRepository skillRepository;
    private final DurationNormalizer durationNormalizer;
    private final DifficultyNormalizer difficultyNormalizer;
    private final ObjectMapper objectMapper;
    private final Map<String, ExternalCourseProvider> providerMap;
    private final ManualCatalogProvider manualCatalogProvider;

    @Autowired
    public ExternalCatalogService(
            CourseRepository courseRepository,
            SkillRepository skillRepository,
            DurationNormalizer durationNormalizer,
            DifficultyNormalizer difficultyNormalizer,
            ObjectMapper objectMapper,
            List<ExternalCourseProvider> providers,
            ManualCatalogProvider manualCatalogProvider) {
        this.courseRepository = courseRepository;
        this.skillRepository = skillRepository;
        this.durationNormalizer = durationNormalizer;
        this.difficultyNormalizer = difficultyNormalizer;
        this.objectMapper = objectMapper;
        this.manualCatalogProvider = manualCatalogProvider;

        this.providerMap = providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toLowerCase(),
                        Function.identity(),
                        (a, b) -> a
                ));
    }

    /**
     * Fetches from a live provider and folds the result into the catalogue.
     *
     * <p>A provider that cannot be reached is reported as a failed import rather than as an
     * import of nothing: the catalogue is unchanged either way, but only one of them is a fault
     * the administrator needs to see.
     */
    @Transactional
    public CatalogImportResult importFromProvider(String providerName, String skillKeyword) {
        if (providerName == null || providerName.isBlank()) {
            throw new IllegalArgumentException("Provider name must be provided");
        }

        ExternalCourseProvider provider = providerMap.get(providerName.trim().toLowerCase());
        if (provider == null) {
            throw new ResourceNotFoundException("External course provider not found: " + providerName);
        }

        List<ExternalCourseDTO> dtos;
        try {
            dtos = provider.fetchCourses(skillKeyword);
        } catch (ExternalProviderException ex) {
            log.warn("Import from provider {} failed: {}", providerName, ex.getMessage());
            return CatalogImportResult.builder()
                    .source(provider.getProviderName())
                    .fromProvider(true)
                    .providerError(ex.getMessage())
                    .rowsRead(0)
                    .created(0)
                    .updated(0)
                    .skipped(0)
                    .errors(List.of())
                    .courses(List.of())
                    .build();
        }

        log.info("Fetched {} courses from provider {} for keyword {}", dtos.size(), providerName, skillKeyword);

        Skill defaultSkill = resolveSkill(skillKeyword);
        Tally tally = new Tally(provider.getProviderName(), true);
        for (ExternalCourseDTO dto : dtos) {
            Skill skill = dto.getSkill() != null ? resolveSkill(dto.getSkill()) : defaultSkill;
            absorb(tally, dto, skill, null);
        }
        return tally.toResult();
    }

    /**
     * Imports a curated CSV or JSON file, accounting for every row it contains.
     *
     * <p>A row that cannot become a course - no title, or a failure while saving it - is recorded
     * with its line number and the reason, and the rest of the file still imports. Rows used to
     * be dropped in silence, so a file of forty courses could import thirty-eight and still look
     * entirely successful.
     */
    @Transactional
    public CatalogImportResult importFromFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        String lower = filename.toLowerCase();
        Tally tally = new Tally(filename, false);
        List<ParsedRow> rows;

        try {
            rows = lower.endsWith(".json") ? parseJsonFile(file) : parseCsvFile(file);
        } catch (IOException e) {
            log.error("Error reading import file: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to parse import file: " + e.getMessage());
        }

        log.info("Parsed {} course entries from uploaded file: {}", rows.size(), filename);

        List<ExternalCourseDTO> curated = new ArrayList<>();
        for (ParsedRow row : rows) {
            if (row.rejection() != null) {
                tally.reject(row.line(), row.rawTitle(), row.rejection());
                continue;
            }
            ExternalCourseDTO dto = row.dto();
            Skill skill = resolveSkill(dto.getSkill() != null ? dto.getSkill() : "General");
            absorb(tally, dto, skill, row.line());
            curated.add(dto);
        }

        if (manualCatalogProvider != null && !curated.isEmpty()) {
            manualCatalogProvider.addCuratedCourses(curated);
        }

        return tally.toResult();
    }

    /** Saves one course and records whether the catalogue gained it or merely refreshed it. */
    private void absorb(Tally tally, ExternalCourseDTO dto, Skill skill, Integer line) {
        try {
            tally.accept(upsertSingleDto(dto, skill));
        } catch (RuntimeException ex) {
            // One bad row must not cost the administrator the other thirty-nine.
            log.warn("A row could not be imported: {}", ex.getMessage());
            tally.reject(line, dto.getTitle(), ex.getMessage());
        }
    }

    /** Running counts for one import, so every row read is accounted for in the result. */
    private final class Tally {
        private final String source;
        private final boolean fromProvider;
        private final List<ExternalCourseResponse> courses = new ArrayList<>();
        private final List<CatalogImportResult.ImportRowError> errors = new ArrayList<>();
        private int created;
        private int updated;

        private Tally(String source, boolean fromProvider) {
            this.source = source;
            this.fromProvider = fromProvider;
        }

        private void accept(Upserted upserted) {
            if (upserted.created()) {
                created++;
            } else {
                updated++;
            }
            courses.add(toResponse(upserted.course()));
        }

        private void reject(Integer line, String title, String reason) {
            errors.add(CatalogImportResult.ImportRowError.builder()
                    .line(line)
                    .title(title == null || title.isBlank() ? null : title)
                    .reason(reason == null ? "Unknown error" : reason)
                    .build());
        }

        private CatalogImportResult toResult() {
            return CatalogImportResult.builder()
                    .source(source)
                    .fromProvider(fromProvider)
                    .rowsRead(created + updated + errors.size())
                    .created(created)
                    .updated(updated)
                    .skipped(errors.size())
                    .errors(List.copyOf(errors))
                    .courses(List.copyOf(courses))
                    .build();
        }
    }

    /** A course as saved, and whether it was new. */
    private record Upserted(Course course, boolean created) {}

    /**
     * One row of an import file: either a course to save, or a rejection carrying the reason.
     * Rejections keep their line number so the administrator can find the row in their own file.
     */
    private record ParsedRow(int line, ExternalCourseDTO dto, String rejection, String rawTitle) {
        static ParsedRow of(int line, ExternalCourseDTO dto) {
            return new ParsedRow(line, dto, null, dto.getTitle());
        }

        static ParsedRow rejected(int line, String rawTitle, String reason) {
            return new ParsedRow(line, null, reason, rawTitle);
        }
    }

    @Transactional(readOnly = true)
    public List<ExternalCourseResponse> getExternalCourses(String skill, String provider) {
        List<Course> courses = courseRepository.findByIsInternalFalse();

        return courses.stream()
                .filter(c -> {
                    if (provider != null && !provider.isBlank()) {
                        if (c.getProvider() == null || !c.getProvider().equalsIgnoreCase(provider.trim())) {
                            return false;
                        }
                    }
                    if (skill != null && !skill.isBlank()) {
                        String sTrim = skill.trim().toLowerCase();
                        boolean skillMatch = false;
                        if (c.getSkillCovered() != null) {
                            if (c.getSkillCovered().getName().toLowerCase().contains(sTrim)) {
                                skillMatch = true;
                            }
                        }
                        if (c.getTitle() != null && c.getTitle().toLowerCase().contains(sTrim)) {
                            skillMatch = true;
                        }
                        if (!skillMatch) return false;
                    }
                    return true;
                })
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExternalCourseResponse getExternalCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for id: " + id));

        if (Boolean.TRUE.equals(course.getIsInternal())) {
            throw new ResourceNotFoundException("Course with id " + id + " is an internal course, not external.");
        }

        return toResponse(course);
    }

    // ── Helper Logic ─────────────────────────────────────────────────────────────

    private Skill resolveSkill(String skillName) {
        if (skillName == null || skillName.isBlank()) {
            skillName = "General";
        }
        final String nameToFind = skillName.trim();
        return skillRepository.findByNameIgnoreCase(nameToFind)
                .orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setName(nameToFind);
                    newSkill.setCategory("Technical");
                    newSkill.setDescription("Auto-created skill for external course catalog");
                    return skillRepository.save(newSkill);
                });
    }

    private Upserted upsertSingleDto(ExternalCourseDTO dto, Skill skill) {
        String title = dto.getTitle() != null ? dto.getTitle().trim() : "Untitled External Course";
        String provider = dto.getProvider() != null ? dto.getProvider().trim() : "External Provider";
        String url = dto.getUrl() != null ? dto.getUrl().trim() : null;

        Optional<Course> existingOpt = Optional.empty();
        if (url != null && !url.isBlank()) {
            existingOpt = courseRepository.findByTitleIgnoreCaseAndProviderIgnoreCaseAndExternalUrl(title, provider, url);
        }
        if (existingOpt.isEmpty()) {
            existingOpt = courseRepository.findByTitleIgnoreCaseAndProviderIgnoreCase(title, provider);
        }

        boolean created = existingOpt.isEmpty();
        Course course;
        if (existingOpt.isPresent()) {
            course = existingOpt.get();
        } else {
            course = new Course();
            course.setIsInternal(false);
        }

        course.setTitle(title);
        course.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        course.setProvider(provider);
        course.setExternalUrl(url);
        course.setSkillCovered(skill);

        String rawDiff = dto.getDifficulty() != null ? dto.getDifficulty() : (title + " " + (dto.getDescription() != null ? dto.getDescription() : ""));
        course.setDifficulty(difficultyNormalizer.normalizeDifficulty(rawDiff));

        String durationLabel = dto.getDurationLabel() != null ? dto.getDurationLabel().trim() : null;
        course.setDurationLabel(durationLabel);

        Double durationHours = null;
        if (dto.getDurationHours() != null) {
            durationHours = dto.getDurationHours().doubleValue();
        } else if (durationLabel != null) {
            durationHours = durationNormalizer.normalizeToHours(durationLabel);
        }
        course.setDurationHours(durationHours);

        return new Upserted(courseRepository.save(course), created);
    }

    // ── Parsing File Uploads ─────────────────────────────────────────────────────

    private List<ParsedRow> parseJsonFile(MultipartFile file) throws IOException {
        JsonNode root = objectMapper.readTree(file.getInputStream());
        List<ParsedRow> rows = new ArrayList<>();

        List<JsonNode> nodes = new ArrayList<>();
        if (root.isArray()) {
            root.forEach(nodes::add);
        } else if (root.isObject()) {
            nodes.add(root);
        }

        for (int i = 0; i < nodes.size(); i++) {
            // JSON has no line numbers to quote, so entries are numbered by position.
            int position = i + 1;
            ExternalCourseDTO dto = jsonNodeToDTO(nodes.get(i));
            if (dto.getTitle() == null || dto.getTitle().isBlank()) {
                rows.add(ParsedRow.rejected(position, null, "No title, so there is nothing to name the course"));
            } else {
                rows.add(ParsedRow.of(position, dto));
            }
        }

        return rows;
    }

    private ExternalCourseDTO jsonNodeToDTO(JsonNode node) {
        String title = node.path("title").asText(node.path("name").asText(""));
        String description = node.path("description").asText("");
        String provider = node.path("provider").asText("External Provider");
        String durationLabel = node.path("durationLabel").asText(node.path("workload").asText(""));
        String url = node.path("url").asText(node.path("externalUrl").asText(node.path("link").asText("")));
        String difficulty = node.path("difficulty").asText(node.path("level").asText(""));
        String skill = node.path("skill").asText(node.path("skillCovered").asText(""));

        Integer durationHours = null;
        if (node.hasNonNull("durationHours")) {
            durationHours = node.path("durationHours").asInt();
        }

        return ExternalCourseDTO.builder()
                .title(title)
                .description(description)
                .provider(provider)
                .durationLabel(durationLabel.isBlank() ? null : durationLabel)
                .durationHours(durationHours)
                .url(url.isBlank() ? null : url)
                .difficulty(difficulty.isBlank() ? null : difficulty)
                .skill(skill.isBlank() ? null : skill)
                .build();
    }

    private List<ParsedRow> parseCsvFile(MultipartFile file) throws IOException {
        List<ParsedRow> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return rows;
            }

            List<String> headers = parseCsvLine(headerLine);
            Map<String, Integer> colMap = new HashMap<>();
            for (int i = 0; i < headers.size(); i++) {
                colMap.put(headers.get(i).trim().toLowerCase(), i);
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) {
                    continue;
                }
                List<String> tokens = parseCsvLine(line);

                String title = getCsvVal(tokens, colMap, "title");
                String description = getCsvVal(tokens, colMap, "description");
                String provider = getCsvVal(tokens, colMap, "provider");
                String skill = getCsvVal(tokens, colMap, "skill");
                String difficulty = getCsvVal(tokens, colMap, "difficulty");
                String durationLabel = getCsvVal(tokens, colMap, "durationlabel");
                if (durationLabel == null) {
                    durationLabel = getCsvVal(tokens, colMap, "duration");
                }
                String url = getCsvVal(tokens, colMap, "url");
                if (url == null) {
                    url = getCsvVal(tokens, colMap, "externalurl");
                }

                if (title == null || title.isBlank()) {
                    // Recorded rather than skipped in silence: a row that vanishes without a
                    // word is how an import of forty comes back reporting thirty-eight and
                    // still looks like it worked.
                    rows.add(ParsedRow.rejected(lineNumber, null,
                            "No title, so there is nothing to name the course"));
                    continue;
                }

                rows.add(ParsedRow.of(lineNumber, ExternalCourseDTO.builder()
                        .title(title)
                        .description(description)
                        .provider(provider != null ? provider : "External Provider")
                        .skill(skill)
                        .difficulty(difficulty)
                        .durationLabel(durationLabel)
                        .url(url)
                        .build()));
            }
        }
        return rows;
    }

    private String getCsvVal(List<String> tokens, Map<String, Integer> colMap, String colName) {
        Integer idx = colMap.get(colName.toLowerCase());
        if (idx != null && idx < tokens.size()) {
            String val = tokens.get(idx).trim();
            return val.isEmpty() ? null : val;
        }
        return null;
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        result.add(sb.toString().trim());
        return result;
    }

    // ── Response Mapping ────────────────────────────────────────────────────────

    public ExternalCourseResponse toResponse(Course c) {
        boolean descMissing = c.getDescription() == null || c.getDescription().isBlank();
        boolean durMissing = (c.getDurationHours() == null || c.getDurationHours() <= 0) && (c.getDurationLabel() == null || c.getDurationLabel().isBlank());
        boolean urlMissing = c.getExternalUrl() == null || c.getExternalUrl().isBlank();

        return ExternalCourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .descriptionMissing(descMissing)
                .provider(c.getProvider())
                .skillId(c.getSkillCovered() != null ? c.getSkillCovered().getId() : null)
                .skillName(c.getSkillCovered() != null ? c.getSkillCovered().getName() : null)
                .difficulty(c.getDifficulty())
                .durationLabel(c.getDurationLabel())
                .durationHours(c.getDurationHours())
                .durationMissing(durMissing)
                .externalUrl(c.getExternalUrl())
                .urlMissing(urlMissing)
                .isInternal(c.getIsInternal())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
