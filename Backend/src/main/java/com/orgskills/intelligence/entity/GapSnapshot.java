package com.orgskills.intelligence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "gap_snapshots")
public class GapSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate snapshotDate;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer totalGaps;

    @Column(nullable = false)
    private Integer criticalGapsCount;

    @Column(nullable = false)
    private Integer highGapsCount;

    @Column(nullable = false)
    private Integer mediumGapsCount;

    @Column(nullable = false)
    private Integer lowGapsCount;

    @Column(nullable = false)
    private Double avgGapScore;

    public GapSnapshot() {
    }

    public GapSnapshot(Long id, LocalDate snapshotDate, String department, Integer totalGaps, Integer criticalGapsCount, Integer highGapsCount, Integer mediumGapsCount, Integer lowGapsCount, Double avgGapScore) {
        this.id = id;
        this.snapshotDate = snapshotDate;
        this.department = department;
        this.totalGaps = totalGaps;
        this.criticalGapsCount = criticalGapsCount;
        this.highGapsCount = highGapsCount;
        this.mediumGapsCount = mediumGapsCount;
        this.lowGapsCount = lowGapsCount;
        this.avgGapScore = avgGapScore;
    }

    @PrePersist
    public void prePersist() {
        if (this.snapshotDate == null) {
            this.snapshotDate = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDate snapshotDate) {
        this.snapshotDate = snapshotDate;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getTotalGaps() {
        return totalGaps;
    }

    public void setTotalGaps(Integer totalGaps) {
        this.totalGaps = totalGaps;
    }

    public Integer getCriticalGapsCount() {
        return criticalGapsCount;
    }

    public void setCriticalGapsCount(Integer criticalGapsCount) {
        this.criticalGapsCount = criticalGapsCount;
    }

    public Integer getHighGapsCount() {
        return highGapsCount;
    }

    public void setHighGapsCount(Integer highGapsCount) {
        this.highGapsCount = highGapsCount;
    }

    public Integer getMediumGapsCount() {
        return mediumGapsCount;
    }

    public void setMediumGapsCount(Integer mediumGapsCount) {
        this.mediumGapsCount = mediumGapsCount;
    }

    public Integer getLowGapsCount() {
        return lowGapsCount;
    }

    public void setLowGapsCount(Integer lowGapsCount) {
        this.lowGapsCount = lowGapsCount;
    }

    public Double getAvgGapScore() {
        return avgGapScore;
    }

    public void setAvgGapScore(Double avgGapScore) {
        this.avgGapScore = avgGapScore;
    }
}
