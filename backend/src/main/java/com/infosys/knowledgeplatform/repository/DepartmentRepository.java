package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    Optional<Department> findByCode(String code);
    Optional<Department> findByHeadEmail(String headEmail);
    
    @Query("SELECT d FROM Department d WHERE d.headEmail = :headEmail")
    List<Department> findByHeadEmailAny(@Param("headEmail") String headEmail);
}
