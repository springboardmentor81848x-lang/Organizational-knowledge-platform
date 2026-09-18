package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Certification;
import com.orgskills.intelligence.entity.enums.CertificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByEmployeeId(Long employeeId);
    List<Certification> findByExpiresAtBeforeAndStatusNot(LocalDate date, CertificationStatus status);
    List<Certification> findByExpiresAtBetween(LocalDate start, LocalDate end);
}
