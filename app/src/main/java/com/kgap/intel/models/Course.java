package com.kgap.intel.models;

public class Course {
    private String title;
    private String instructor;
    private int progress;

    public Course(String title, String instructor, int progress) {
        this.title = title;
        this.instructor = instructor;
        this.progress = progress;
    }

    public String getTitle() { return title; }
    public String getInstructor() { return instructor; }
    public int getProgress() { return progress; }
}
