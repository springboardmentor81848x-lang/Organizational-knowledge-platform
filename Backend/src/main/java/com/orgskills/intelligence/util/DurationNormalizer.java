package com.orgskills.intelligence.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class DurationNormalizer {

    private static final Pattern HOURS_PATTERN = Pattern.compile("(?i)(\\d+(?:\\.\\d+)?)\\s*(?:hours|hour|hrs|hr|h)\\b");
    private static final Pattern MINUTES_PATTERN = Pattern.compile("(?i)(\\d+)\\s*(?:minutes|minute|mins|min)\\b");
    private static final Pattern WEEKS_PATTERN = Pattern.compile("(?i)(\\d+)\\s*(?:weeks|week|wks|wk)\\b");
    private static final Pattern WEEKLY_HOURS_PATTERN = Pattern.compile("(?i)(\\d+)(?:-(\\d+))?\\s*hours?\\s*(?:a|per)\\s*week");
    private static final Pattern PURE_NUMBER_PATTERN = Pattern.compile("^\\s*(\\d+(?:\\.\\d+)?)\\s*$");

    private int defaultHoursPerWeek = 10;

    public Double normalizeToHours(String durationLabel) {
        if (durationLabel == null || durationLabel.isBlank()) {
            return null;
        }

        String label = durationLabel.trim();

        // 1. Pure number check (e.g. "8" or "8.5")
        Matcher numberMatcher = PURE_NUMBER_PATTERN.matcher(label);
        if (numberMatcher.matches()) {
            return Double.parseDouble(numberMatcher.group(1));
        }

        // 2. Weekly study pattern check e.g. "4 weeks of study, 2-4 hours a week"
        Matcher weeksMatcher = WEEKS_PATTERN.matcher(label);
        Matcher weeklyHoursMatcher = WEEKLY_HOURS_PATTERN.matcher(label);

        if (weeksMatcher.find()) {
            int numWeeks = Integer.parseInt(weeksMatcher.group(1));
            double hoursPerWk = defaultHoursPerWeek;

            if (weeklyHoursMatcher.find()) {
                double minH = Double.parseDouble(weeklyHoursMatcher.group(1));
                if (weeklyHoursMatcher.group(2) != null) {
                    double maxH = Double.parseDouble(weeklyHoursMatcher.group(2));
                    hoursPerWk = (minH + maxH) / 2.0;
                } else {
                    hoursPerWk = minH;
                }
            }
            return numWeeks * hoursPerWk;
        }

        // 3. Direct Hours check e.g. "8 Hours" or "1.5 hrs"
        Matcher hoursMatcher = HOURS_PATTERN.matcher(label);
        if (hoursMatcher.find()) {
            return Double.parseDouble(hoursMatcher.group(1));
        }

        // 4. Minutes check e.g. "90 mins"
        Matcher minutesMatcher = MINUTES_PATTERN.matcher(label);
        if (minutesMatcher.find()) {
            int mins = Integer.parseInt(minutesMatcher.group(1));
            return Math.round((mins / 60.0) * 10.0) / 10.0;
        }

        log.debug("Could not parse durationLabel: {}", durationLabel);
        return null;
    }

    public Integer normalizeToIntegerHours(String durationLabel) {
        Double doubleVal = normalizeToHours(durationLabel);
        if (doubleVal == null) {
            return null;
        }
        return (int) Math.round(doubleVal);
    }
}
