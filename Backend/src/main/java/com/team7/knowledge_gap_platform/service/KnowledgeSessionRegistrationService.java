package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.KnowledgeSessionRegistration;
import com.team7.knowledge_gap_platform.repository.KnowledgeSessionRegistrationRepository;

@Service
public class KnowledgeSessionRegistrationService {

    private final KnowledgeSessionRegistrationRepository repository;

    public KnowledgeSessionRegistrationService(
            KnowledgeSessionRegistrationRepository repository) {
        this.repository = repository;
    }

    public KnowledgeSessionRegistration register(
            KnowledgeSessionRegistration registration) {

        registration.setStatus("REGISTERED");
        registration.setAttended(false);
        registration.setRegisteredAt(LocalDateTime.now());

        return repository.save(registration);
    }

    public KnowledgeSessionRegistration cancelRegistration(Long id) {

        KnowledgeSessionRegistration registration = getRegistration(id);

        registration.setStatus("CANCELLED");

        return repository.save(registration);
    }

    public KnowledgeSessionRegistration markAttendance(Long id) {

        KnowledgeSessionRegistration registration = getRegistration(id);

        registration.setAttended(true);

        return repository.save(registration);
    }

    public KnowledgeSessionRegistration getRegistration(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session registration not found"));
    }

    public List<KnowledgeSessionRegistration> getBySession(Long sessionId) {

        return repository.findBySessionId(sessionId);
    }

    public List<KnowledgeSessionRegistration> getByEmployee(Long employeeId) {

        return repository.findByEmployeeId(employeeId);
    }

    public List<KnowledgeSessionRegistration> getRegisteredParticipants(
            Long sessionId) {

        return repository.findBySessionIdAndStatus(
                sessionId,
                "REGISTERED");
    }
}