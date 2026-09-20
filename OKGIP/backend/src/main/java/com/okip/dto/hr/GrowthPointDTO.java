package com.okip.dto.hr;

public class GrowthPointDTO {
    private String month;
    private int count;

    public GrowthPointDTO() {}
    public GrowthPointDTO(String month, int count) { this.month = month; this.count = count; }
    public String getMonth() { return month; }
    public void setMonth(String v) { month = v; }
    public int getCount() { return count; }
    public void setCount(int v) { count = v; }
}
