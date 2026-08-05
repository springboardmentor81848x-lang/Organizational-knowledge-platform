package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeGapRepository extends JpaRepository<KnowledgeGap, Long> {
    List<KnowledgeGap> findByEmployee(Employee employee);
    void deleteByEmployee(Employee employee);
}