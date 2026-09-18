package com.orgskills.intelligence.util;

import org.springframework.stereotype.Component;

@Component
public class DifficultyNormalizer {

    public String normalizeDifficulty(String rawDifficulty) {
        if (rawDifficulty == null || rawDifficulty.isBlank()) {
            return "INTERMEDIATE";
        }

        String lower = rawDifficulty.trim().toLowerCase();

        if (lower.contains("begin") || lower.contains("intro") || lower.contains("fundament")
                || lower.contains("basic") || lower.contains("starter") || lower.contains("easy")
                || lower.contains("novice") || lower.contains("level 1")) {
            return "BEGINNER";
        }

        if (lower.contains("advanc") || lower.contains("expert") || lower.contains("master")
                || lower.contains("proficient") || lower.contains("deep dive") || lower.contains("hard")
                || lower.contains("level 3") || lower.contains("specialization")) {
            return "ADVANCED";
        }

        if (lower.contains("intermed") || lower.contains("medium") || lower.contains("level 2")) {
            return "INTERMEDIATE";
        }

        return "INTERMEDIATE";
    }
}
