package com.knowledgegap.dto;

import java.util.List;

public class TrainingAdoptionDTO {

    // =========================================================
    // SUMMARY
    // =========================================================

    private long totalEmployees;
    private long enrolledEmployees;
    private double adoptionRate;

    private long totalEnrollments;
    private long notStartedEnrollments;
    private long inProgressEnrollments;
    private long completedEnrollments;
    private long certifiedEnrollments;

    // =========================================================
    // COURSE DETAILS
    // =========================================================

    private List<CourseAdoptionItemDTO> courses;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TrainingAdoptionDTO() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getEnrolledEmployees() {
        return enrolledEmployees;
    }

    public void setEnrolledEmployees(long enrolledEmployees) {
        this.enrolledEmployees = enrolledEmployees;
    }

    public double getAdoptionRate() {
        return adoptionRate;
    }

    public void setAdoptionRate(double adoptionRate) {
        this.adoptionRate = adoptionRate;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public void setTotalEnrollments(long totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }

    public long getNotStartedEnrollments() {
        return notStartedEnrollments;
    }

    public void setNotStartedEnrollments(long notStartedEnrollments) {
        this.notStartedEnrollments = notStartedEnrollments;
    }

    public long getInProgressEnrollments() {
        return inProgressEnrollments;
    }

    public void setInProgressEnrollments(long inProgressEnrollments) {
        this.inProgressEnrollments = inProgressEnrollments;
    }

    public long getCompletedEnrollments() {
        return completedEnrollments;
    }

    public void setCompletedEnrollments(long completedEnrollments) {
        this.completedEnrollments = completedEnrollments;
    }

    public long getCertifiedEnrollments() {
        return certifiedEnrollments;
    }

    public void setCertifiedEnrollments(long certifiedEnrollments) {
        this.certifiedEnrollments = certifiedEnrollments;
    }

    public List<CourseAdoptionItemDTO> getCourses() {
        return courses;
    }

    public void setCourses(List<CourseAdoptionItemDTO> courses) {
        this.courses = courses;
    }

    // =========================================================
    // INNER DTO
    // =========================================================

    public static class CourseAdoptionItemDTO {

        private Long courseId;
        private String courseTitle;
        private String skillName;

        private long enrolledEmployees;
        private long completedEmployees;

        private double adoptionPercentage;
        private double completionPercentage;

        // -----------------------------------------------------
        // CONSTRUCTOR
        // -----------------------------------------------------

        public CourseAdoptionItemDTO() {
        }

        // -----------------------------------------------------
        // GETTERS / SETTERS
        // -----------------------------------------------------

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public String getCourseTitle() {
            return courseTitle;
        }

        public void setCourseTitle(String courseTitle) {
            this.courseTitle = courseTitle;
        }

        public String getSkillName() {
            return skillName;
        }

        public void setSkillName(String skillName) {
            this.skillName = skillName;
        }

        public long getEnrolledEmployees() {
            return enrolledEmployees;
        }

        public void setEnrolledEmployees(long enrolledEmployees) {
            this.enrolledEmployees = enrolledEmployees;
        }

        public long getCompletedEmployees() {
            return completedEmployees;
        }

        public void setCompletedEmployees(long completedEmployees) {
            this.completedEmployees = completedEmployees;
        }

        public double getAdoptionPercentage() {
            return adoptionPercentage;
        }

        public void setAdoptionPercentage(double adoptionPercentage) {
            this.adoptionPercentage = adoptionPercentage;
        }

        public double getCompletionPercentage() {
            return completionPercentage;
        }

        public void setCompletionPercentage(double completionPercentage) {
            this.completionPercentage = completionPercentage;
        }
    }
}