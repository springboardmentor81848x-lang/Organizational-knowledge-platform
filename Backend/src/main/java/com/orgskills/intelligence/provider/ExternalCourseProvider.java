package com.orgskills.intelligence.provider;

import com.orgskills.intelligence.dto.ld.ExternalCourseDTO;

import java.util.List;

public interface ExternalCourseProvider {
    String getProviderName();
    List<ExternalCourseDTO> fetchCourses(String skillKeyword);
}
