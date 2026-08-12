package com.kgap.intel.models;

public class Certification {
    private String title;
    private String issuer;
    private String date;

    public Certification(String title, String issuer, String date) {
        this.title = title;
        this.issuer = issuer;
        this.date = date;
    }

    public String getTitle() { return title; }
    public String getIssuer() { return issuer; }
    public String getDate() { return date; }
}
