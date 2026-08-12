package com.kgap.intel.models;

public class Role {
    private String title;
    private int iconRes;
    private boolean selected;

    public Role(String title, int iconRes) {
        this.title = title;
        this.iconRes = iconRes;
        this.selected = false;
    }

    public String getTitle() { return title; }
    public int getIconRes() { return iconRes; }
    public boolean isSelected() { return selected; }
    public void setSelected(boolean selected) { this.selected = selected; }
}
