package com.kgap.intel.models;

public class Certification {
    private String title;
    private String issuer;
    private String date;
    private String status; // ACTIVE, EXPIRING_SOON, EXPIRED
    private String expiryDate;

    public Certification(String title, String issuer, String date) {
        this(title, issuer, date, "ACTIVE", "2027-12-31");
    }

    public Certification(String title, String issuer, String date, String status, String expiryDate) {
        this.title = title;
        this.issuer = issuer;
        this.date = date;
        this.status = status;
        this.expiryDate = expiryDate;
    }

    public String getTitle() { return title; }
    public String getIssuer() { return issuer; }
    public String getDate() { return date; }
    public String getStatus() { return status != null ? status : "ACTIVE"; }
    public String getExpiryDate() { return expiryDate != null ? expiryDate : "Valid"; }
}
