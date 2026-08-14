package com.knowledgeiq.repository;

import com.knowledgeiq.model.SkillGapSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillGapSnapshotRepository extends JpaRepository<SkillGapSnapshot, UUID> {
    List<SkillGapSnapshot> findByUserIdOrderBySnapshotDateAsc(UUID userId);
}
