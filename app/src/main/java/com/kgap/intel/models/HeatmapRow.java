package com.kgap.intel.models;

import java.util.List;

public class HeatmapRow {
    private String label;
    private List<HeatmapResponse> cells;

    public HeatmapRow(String label, List<HeatmapResponse> cells) {
        this.label = label;
        this.cells = cells;
    }

    public String getLabel() { return label; }
    public List<HeatmapResponse> getCells() { return cells; }
}
