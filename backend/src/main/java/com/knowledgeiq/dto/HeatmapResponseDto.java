package com.knowledgeiq.dto;

import java.util.List;
import java.util.Map;

public class HeatmapResponseDto {
    private String scope; // PERSONAL, TEAM, DEPARTMENT, ORGANIZATION
    private String scopeName;
    private List<String> rows;
    private List<String> cols;
    private List<List<Integer>> values;
    private List<HeatmapCellDto> cells;
    private List<GapAlertDto> alerts;
    private Map<String, Object> summary;

    public HeatmapResponseDto() {}

    public HeatmapResponseDto(String scope, String scopeName, List<String> rows, List<String> cols, List<List<Integer>> values, List<HeatmapCellDto> cells, List<GapAlertDto> alerts, Map<String, Object> summary) {
        this.scope = scope;
        this.scopeName = scopeName;
        this.rows = rows;
        this.cols = cols;
        this.values = values;
        this.cells = cells;
        this.alerts = alerts;
        this.summary = summary;
    }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }

    public String getScopeName() { return scopeName; }
    public void setScopeName(String scopeName) { this.scopeName = scopeName; }

    public List<String> getRows() { return rows; }
    public void setRows(List<String> rows) { this.rows = rows; }

    public List<String> getCols() { return cols; }
    public void setCols(List<String> cols) { this.cols = cols; }

    public List<List<Integer>> getValues() { return values; }
    public void setValues(List<List<Integer>> values) { this.values = values; }

    public List<HeatmapCellDto> getCells() { return cells; }
    public void setCells(List<HeatmapCellDto> cells) { this.cells = cells; }

    public List<GapAlertDto> getAlerts() { return alerts; }
    public void setAlerts(List<GapAlertDto> alerts) { this.alerts = alerts; }

    public Map<String, Object> getSummary() { return summary; }
    public void setSummary(Map<String, Object> summary) { this.summary = summary; }
}
