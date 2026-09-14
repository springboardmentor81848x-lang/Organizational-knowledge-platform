package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {
    List<TrainingProgram> findByTargetSkillCategory(String category);
}
