package com.knowledgeiq.repository;

import com.knowledgeiq.model.CustomQuestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomQuestionnaireRepository extends JpaRepository<CustomQuestionnaire, UUID> {
    List<CustomQuestionnaire> findByOrderByCreatedAtDesc();
}
