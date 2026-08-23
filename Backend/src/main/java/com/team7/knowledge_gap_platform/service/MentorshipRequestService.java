package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.MentorshipRequest;
import com.team7.knowledge_gap_platform.repository.MentorshipRequestRepository;

@Service
public class MentorshipRequestService {

    private final MentorshipRequestRepository repository;
    private final com.team7.knowledge_gap_platform.repository.EmployeeRepository employeeRepository;

    public MentorshipRequestService(
            MentorshipRequestRepository repository,
            com.team7.knowledge_gap_platform.repository.EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public MentorshipRequest sendRequest(
            MentorshipRequest request) {

        if (request == null || request.getMentorId() == null) {
            throw new RuntimeException("Invalid mentor request.");
        }

        com.team7.knowledge_gap_platform.entity.Employee mentor = employeeRepository.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Target mentor employee record not found."));

        String role = mentor.getRole();
        if (!"EMPLOYEE".equalsIgnoreCase(role) && !"MENTOR".equalsIgnoreCase(role)) {
            throw new RuntimeException("User with role " + role + " is not eligible to receive mentorship requests.");
        }

        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        return repository.save(request);
    }

    public MentorshipRequest acceptRequest(Long requestId) {

        MentorshipRequest request = getRequest(requestId);

        request.setStatus("ACCEPTED");
        request.setUpdatedAt(LocalDateTime.now());

        return repository.save(request);
    }

    public MentorshipRequest rejectRequest(Long requestId) {

        MentorshipRequest request = getRequest(requestId);

        request.setStatus("REJECTED");
        request.setUpdatedAt(LocalDateTime.now());

        return repository.save(request);
    }

    public MentorshipRequest cancelRequest(Long requestId) {

        MentorshipRequest request = getRequest(requestId);

        request.setStatus("CANCELLED");
        request.setUpdatedAt(LocalDateTime.now());

        return repository.save(request);
    }

    public MentorshipRequest getRequest(Long requestId) {

        return repository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Mentorship request not found"));
    }

    public List<MentorshipRequest> getRequestsByMentee(
            Long menteeId) {

        return repository.findByMenteeId(menteeId);
    }

    public List<MentorshipRequest> getRequestsByMentor(
            Long mentorId) {

        return repository.findByMentorId(mentorId);
    }

    public List<MentorshipRequest> getPendingRequestsByMentor(
            Long mentorId) {

        return repository.findByMentorIdAndStatus(
                mentorId,
                "PENDING");
    }
}