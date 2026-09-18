package com.knowledgegap.repository;

import com.knowledgegap.entity.Competency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetencyRepository extends JpaRepository<Competency, Long> {

    List<Competency> findByDesignation(String designation);

}