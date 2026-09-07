package com.okip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Certification;

public interface CertificationRepository
        extends JpaRepository<Certification, Long> {

    List<Certification> findByEmployee(
            Employee employee);

}