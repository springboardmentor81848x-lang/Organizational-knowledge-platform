package com.orgskills.intelligence.dto.report;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * One block of a report: either a set of labelled figures or a table. Sections are format
 * agnostic, which is what lets the PDF and the spreadsheet be rendered from the same values
 * rather than assembled twice.
 */
public class ReportSection {

    private final String heading;
    private final Map<String, String> figures = new LinkedHashMap<>();
    private final List<String> columns = new ArrayList<>();
    private final List<List<String>> rows = new ArrayList<>();
    private String emptyMessage = "No data recorded.";

    public ReportSection(String heading) {
        this.heading = heading;
    }

    /** Adds a labelled figure to a summary block. */
    public ReportSection figure(String label, Object value) {
        figures.put(label, value == null ? "-" : String.valueOf(value));
        return this;
    }

    public ReportSection columns(String... names) {
        columns.addAll(Arrays.asList(names));
        return this;
    }

    public ReportSection row(Object... values) {
        List<String> cells = new ArrayList<>(values.length);
        for (Object value : values) {
            cells.add(value == null ? "-" : String.valueOf(value));
        }
        rows.add(cells);
        return this;
    }

    /** What to print when the table has no rows, so a section is never a blank space. */
    public ReportSection emptyMessage(String message) {
        this.emptyMessage = message;
        return this;
    }

    public String getHeading() {
        return heading;
    }

    public Map<String, String> getFigures() {
        return figures;
    }

    public List<String> getColumns() {
        return columns;
    }

    public List<List<String>> getRows() {
        return rows;
    }

    public String getEmptyMessage() {
        return emptyMessage;
    }

    public boolean isTable() {
        return !columns.isEmpty();
    }
}
