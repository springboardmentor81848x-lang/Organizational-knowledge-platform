package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByEmployeeEmail(String email);
}
