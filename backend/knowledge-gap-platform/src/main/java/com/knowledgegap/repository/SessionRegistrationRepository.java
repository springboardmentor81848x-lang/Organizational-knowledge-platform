package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.SessionRegistration;

public interface SessionRegistrationRepository
        extends JpaRepository<SessionRegistration, Long> {

    // =========================================================
    // GET REGISTRATIONS FOR A SESSION
    // =========================================================

    List<SessionRegistration> findBySessionId(
            Long sessionId);

    // =========================================================
    // GET REGISTRATIONS FOR A SESSION BY STATUS
    // =========================================================

    List<SessionRegistration> findBySessionIdAndStatus(
            Long sessionId,
            String status);

    // =========================================================
    // GET REGISTRATION FOR EMPLOYEE + SESSION
    // =========================================================

    Optional<SessionRegistration>
    findBySessionIdAndEmployeeId(
            Long sessionId,
            Long employeeId);

    // =========================================================
    // GET REGISTRATIONS FOR EMPLOYEE
    // =========================================================

    List<SessionRegistration> findByEmployeeId(
            Long employeeId);

    // =========================================================
    // COUNT REGISTERED EMPLOYEES
    // =========================================================

    Long countBySessionIdAndStatus(
            Long sessionId,
            String status);

    // =========================================================
    // COUNT ATTENDEES
    // =========================================================

    Long countBySessionIdAndAttendedTrue(
            Long sessionId);
}