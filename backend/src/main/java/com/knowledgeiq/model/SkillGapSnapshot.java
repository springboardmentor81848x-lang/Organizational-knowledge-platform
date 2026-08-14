package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_gap_snapshots")
public class SkillGapSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "total_gaps")
    private Integer totalGaps = 0;

    @Column(name = "critical_gaps")
    private Integer criticalGaps = 0;

    @Column(name = "avg_gap_score")
    private Double avgGapScore = 0.0;

    @Column(name = "gap_percent")
    private Integer gapPercent = 0;

    @Column(name = "snapshot_date")
    private ZonedDateTime snapshotDate = ZonedDateTime.now();

    public SkillGapSnapshot() {}

    public SkillGapSnapshot(User user, Integer totalGaps, Integer criticalGaps, Double avgGapScore) {
        this.user = user;
        this.totalGaps = totalGaps;
        this.criticalGaps = criticalGaps;
        this.avgGapScore = avgGapScore;
        this.snapshotDate = ZonedDateTime.now();
    }

    public SkillGapSnapshot(User user, Integer totalGaps, Integer criticalGaps, Double avgGapScore, Integer gapPercent) {
        this.user = user;
        this.totalGaps = totalGaps;
        this.criticalGaps = criticalGaps;
        this.avgGapScore = avgGapScore;
        this.gapPercent = gapPercent;
        this.snapshotDate = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getTotalGaps() { return totalGaps; }
    public void setTotalGaps(Integer totalGaps) { this.totalGaps = totalGaps; }

    public Integer getCriticalGaps() { return criticalGaps; }
    public void setCriticalGaps(Integer criticalGaps) { this.criticalGaps = criticalGaps; }

    public Double getAvgGapScore() { return avgGapScore; }
    public void setAvgGapScore(Double avgGapScore) { this.avgGapScore = avgGapScore; }

    public Integer getGapPercent() { return gapPercent; }
    public void setGapPercent(Integer gapPercent) { this.gapPercent = gapPercent; }

    public ZonedDateTime getSnapshotDate() { return snapshotDate; }
}
