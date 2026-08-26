package com.okgip.repository;

import com.okgip.entity.SessionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRegistrationRepository extends JpaRepository<SessionRegistration, Long> {
    List<SessionRegistration> findBySessionId(Long sessionId);
    List<SessionRegistration> findByEmployeeId(Long employeeId);
    Optional<SessionRegistration> findBySessionIdAndEmployeeId(Long sessionId, Long employeeId);
    Long countBySessionIdAndAttendanceStatusNot(Long sessionId, String attendanceStatus);
}
