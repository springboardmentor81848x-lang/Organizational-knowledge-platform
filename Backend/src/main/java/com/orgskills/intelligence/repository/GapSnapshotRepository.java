package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.GapSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GapSnapshotRepository extends JpaRepository<GapSnapshot, Long> {
    List<GapSnapshot> findByDepartmentIgnoreCaseOrderBySnapshotDateAsc(String department);
    List<GapSnapshot> findByOrderBySnapshotDateAsc();
}
