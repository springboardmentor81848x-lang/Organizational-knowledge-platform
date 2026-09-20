package com.okip.service.mentorship;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.okip.dto.mentorship.KnowledgeResourceDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.KnowledgeSession;
import com.okip.entity.transaction.KnowledgeSharingResource;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.KnowledgeSessionRepository;
import com.okip.repository.KnowledgeSharingResourceRepository;
import com.okip.service.notification.NotificationService;

@Service
@Transactional
public class KnowledgeSharingResourceServiceImpl implements KnowledgeSharingResourceService {

    private static final long MAX_FILE_SIZE = 10L * 1024L * 1024L;

    private final KnowledgeSharingResourceRepository resourceRepository;
    private final KnowledgeSessionRepository sessionRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public KnowledgeSharingResourceServiceImpl(
            KnowledgeSharingResourceRepository resourceRepository,
            KnowledgeSessionRepository sessionRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {
        this.resourceRepository = resourceRepository;
        this.sessionRepository = sessionRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<KnowledgeResourceDTO> getResources(Long sessionId) {
        KnowledgeSession session = getSession(sessionId);
        Employee current = getLoggedInEmployee();
        requireParticipant(session, current);
        return resourceRepository.findBySessionKnowledgeSessionIdOrderByCreatedAtDesc(sessionId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public KnowledgeResourceDTO upload(Long sessionId, MultipartFile file, String title, String description) {
        KnowledgeSession session = getSession(sessionId);
        Employee current = getLoggedInEmployee();
        requireParticipant(session, current);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 10 MB.");
        }

        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("resource");
        String safeName = originalName.replace("\\", "/");
        safeName = safeName.substring(safeName.lastIndexOf('/') + 1);
        String lower = safeName.toLowerCase();
        if (!(lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx")
                || lower.endsWith(".txt") || lower.endsWith(".md"))) {
            throw new IllegalArgumentException("Only PDF, DOC, DOCX, TXT and MD files are supported.");
        }

        try {
            KnowledgeSharingResource resource = new KnowledgeSharingResource();
            resource.setSession(session);
            resource.setAuthor(current);
            resource.setTitle(title == null || title.isBlank() ? safeName : title.trim());
            resource.setDescription(description == null ? null : description.trim());
            resource.setResourceType("DOCUMENT");
            resource.setFileName(safeName);
            resource.setContentType(Optional.ofNullable(file.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE));
            resource.setFileSize(file.getSize());
            resource.setFileData(file.getBytes());
            KnowledgeSharingResource saved = resourceRepository.save(resource);

            var request = session.getMentorshipRequest();
            Employee other = request.getMentor().getEmployeeId().equals(current.getEmployeeId())
                    ? request.getMentee() : request.getMentor();
            notificationService.notifyEmployee(
                    other.getEmployeeId(),
                    "KNOWLEDGE_RESOURCE",
                    "New learning material shared",
                    fullName(current) + " shared '" + saved.getTitle() + "' in your knowledge-sharing session.",
                    request.getMentor().getEmployeeId().equals(other.getEmployeeId())
                            ? "/mentor/knowledge-sharing" : "/employee/mentorship");

            return toDto(saved);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read the uploaded file.", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ByteArrayResource> download(Long resourceId) {
        KnowledgeSharingResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge resource not found."));
        Employee current = getLoggedInEmployee();
        requireParticipant(resource.getSession(), current);
        if (resource.getFileData() == null) {
            throw new ResourceNotFoundException("This resource does not contain a downloadable file.");
        }

        String fileName = resource.getFileName() == null ? "knowledge-resource" : resource.getFileName();
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(
                    Optional.ofNullable(resource.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE));
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        ByteArrayResource body = new ByteArrayResource(resource.getFileData());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(resource.getFileData().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName.replace("\"", "") + "\"")
                .body(body);
    }

    @Override
    public void delete(Long resourceId) {
        KnowledgeSharingResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge resource not found."));
        Employee current = getLoggedInEmployee();
        requireParticipant(resource.getSession(), current);
        if (resource.getAuthor() == null || !resource.getAuthor().getEmployeeId().equals(current.getEmployeeId())) {
            throw new AccessDeniedException("Only the person who uploaded the resource can delete it.");
        }
        resourceRepository.delete(resource);
    }

    private KnowledgeSession getSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));
    }

    private Employee getLoggedInEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResourceNotFoundException("Authenticated employee not found.");
        }
        return employeeRepository.findByOfficialEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
    }

    private void requireParticipant(KnowledgeSession session, Employee employee) {
        if (session == null || session.getMentorshipRequest() == null) {
            throw new ResourceNotFoundException("Invalid knowledge-sharing session.");
        }
        var request = session.getMentorshipRequest();
        boolean participant = (request.getMentor() != null && request.getMentor().getEmployeeId().equals(employee.getEmployeeId()))
                || (request.getMentee() != null && request.getMentee().getEmployeeId().equals(employee.getEmployeeId()));
        if (!participant) {
            throw new AccessDeniedException("You are not a participant in this knowledge-sharing session.");
        }
    }

    private KnowledgeResourceDTO toDto(KnowledgeSharingResource resource) {
        KnowledgeResourceDTO dto = new KnowledgeResourceDTO();
        dto.setResourceId(resource.getResourceId());
        dto.setSessionId(resource.getSession() == null ? null : resource.getSession().getKnowledgeSessionId());
        dto.setTitle(resource.getTitle());
        dto.setDescription(resource.getDescription());
        dto.setResourceType(resource.getResourceType());
        dto.setFileName(resource.getFileName());
        dto.setContentType(resource.getContentType());
        dto.setFileSize(resource.getFileSize());
        dto.setUrl(resource.getUrl());
        dto.setAuthorId(resource.getAuthor() == null ? null : resource.getAuthor().getEmployeeId());
        dto.setAuthorName(resource.getAuthor() == null ? null : fullName(resource.getAuthor()));
        dto.setCreatedAt(resource.getCreatedAt());
        return dto;
    }

    private String fullName(Employee employee) {
        return (Optional.ofNullable(employee.getFirstName()).orElse("") + " "
                + Optional.ofNullable(employee.getLastName()).orElse("")).trim();
    }
}
