package com.okip.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.KnowledgeSession;
import com.okip.entity.transaction.SessionRegistration;

@Repository
public interface SessionRegistrationRepository extends JpaRepository<SessionRegistration, Long> {
    List<SessionRegistration> findByEmployeeOrderByRegisteredAtDesc(Employee employee);
    List<SessionRegistration> findBySession(KnowledgeSession session);
    Optional<SessionRegistration> findBySessionAndEmployee(KnowledgeSession session, Employee employee);
    boolean existsBySessionAndEmployee(KnowledgeSession session, Employee employee);
    long countBySession(KnowledgeSession session);
}
