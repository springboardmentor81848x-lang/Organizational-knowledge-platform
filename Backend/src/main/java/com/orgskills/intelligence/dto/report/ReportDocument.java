package com.orgskills.intelligence.dto.report;

import java.util.ArrayList;
import java.util.List;

/**
 * A rendered-format-independent report. Built once from live query results, then handed to
 * whichever renderer the caller asked for.
 */
public class ReportDocument {

    private final String title;
    private final String subtitle;
    /** Base filename, without an extension; the format supplies that. */
    private final String fileBaseName;
    private final List<ReportSection> sections = new ArrayList<>();

    public ReportDocument(String title, String subtitle, String fileBaseName) {
        this.title = title;
        this.subtitle = subtitle;
        this.fileBaseName = fileBaseName;
    }

    public ReportSection section(String heading) {
        ReportSection section = new ReportSection(heading);
        sections.add(section);
        return section;
    }

    public String getTitle() {
        return title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public String getFileBaseName() {
        return fileBaseName;
    }

    public List<ReportSection> getSections() {
        return sections;
    }
}
