package com.orgskills.intelligence.provider;

import com.orgskills.intelligence.dto.ld.ExternalCourseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
public class ManualCatalogProvider implements ExternalCourseProvider {

    private final List<ExternalCourseDTO> curatedCourses = new CopyOnWriteArrayList<>();

    @Override
    public String getProviderName() {
        return "Manual";
    }

    @Override
    public List<ExternalCourseDTO> fetchCourses(String skillKeyword) {
        log.info("Fetching manually curated courses for skill keyword: {}", skillKeyword);
        if (skillKeyword == null || skillKeyword.isBlank()) {
            return new ArrayList<>(curatedCourses);
        }

        String searchLower = skillKeyword.trim().toLowerCase();
        return curatedCourses.stream()
                .filter(c -> (c.getTitle() != null && c.getTitle().toLowerCase().contains(searchLower))
                        || (c.getDescription() != null && c.getDescription().toLowerCase().contains(searchLower))
                        || (c.getSkill() != null && c.getSkill().toLowerCase().contains(searchLower)))
                .toList();
    }

    public void addCuratedCourses(List<ExternalCourseDTO> courses) {
        if (courses != null && !courses.isEmpty()) {
            this.curatedCourses.addAll(courses);
        }
    }

    public void clearCuratedCourses() {
        this.curatedCourses.clear();
    }

    public List<ExternalCourseDTO> getCuratedCourses() {
        return Collections.unmodifiableList(curatedCourses);
    }
}
