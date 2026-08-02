package com.knowledgegap.repository;

import com.knowledgegap.entity.KnowledgeGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KnowledgeGapRepository extends JpaRepository<KnowledgeGap, Long> {

}