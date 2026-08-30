package com.okip.service.resource.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.resource.KnowledgeResourceDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.KnowledgeResource;
import com.okip.enums.ResourceType;
import com.okip.exception.BadRequestException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.KnowledgeResourceRepository;
import com.okip.repository.SkillRepository;
import com.okip.service.resource.KnowledgeResourceService;

@Service
public class KnowledgeResourceServiceImpl implements KnowledgeResourceService {

    private final KnowledgeResourceRepository resourceRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;

    public KnowledgeResourceServiceImpl(
            KnowledgeResourceRepository resourceRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository) {
        this.resourceRepository = resourceRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    @Transactional
    public KnowledgeResourceDTO createResource(KnowledgeResourceDTO request) {
        Employee author = getLoggedInEmployee();
        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId()).orElse(null);
        }

        ResourceType rType;
        try {
            rType = ResourceType.valueOf(request.getResourceType().toUpperCase());
        } catch (Exception e) {
            rType = ResourceType.ARTICLE;
        }

        KnowledgeResource res = new KnowledgeResource();
        res.setTitle(request.getTitle());
        res.setDescription(request.getDescription());
        res.setUrl(request.getUrl());
        res.setContent(request.getContent());
        res.setResourceType(rType);
        res.setSkill(skill);
        res.setAuthor(author);

        KnowledgeResource saved = resourceRepository.save(res);
        return convertToDTO(saved);
    }

    @Override
    public List<KnowledgeResourceDTO> getAllResources(Long skillId, String resourceType, String search) {
        List<KnowledgeResource> all = resourceRepository.findAllByOrderByCreatedAtDesc();

        return all.stream()
                .filter(r -> {
                    if (skillId != null) {
                        return r.getSkill() != null && r.getSkill().getSkillId().equals(skillId);
                    }
                    return true;
                })
                .filter(r -> {
                    if (resourceType != null && !resourceType.isBlank() && !resourceType.equalsIgnoreCase("all")) {
                        return r.getResourceType().name().equalsIgnoreCase(resourceType);
                    }
                    return true;
                })
                .filter(r -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        return r.getTitle().toLowerCase().contains(s) || (r.getDescription() != null && r.getDescription().toLowerCase().contains(s));
                    }
                    return true;
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public KnowledgeResourceDTO getResourceById(Long resourceId) {
        KnowledgeResource r = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge resource not found."));
        return convertToDTO(r);
    }

    @Override
    @Transactional
    public void deleteResource(Long resourceId) {
        KnowledgeResource r = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge resource not found."));
        resourceRepository.delete(r);
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private KnowledgeResourceDTO convertToDTO(KnowledgeResource r) {
        KnowledgeResourceDTO dto = new KnowledgeResourceDTO();
        dto.setResourceId(r.getResourceId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setUrl(r.getUrl());
        dto.setContent(r.getContent());
        dto.setResourceType(r.getResourceType().name());

        if (r.getSkill() != null) {
            dto.setSkillId(r.getSkill().getSkillId());
            dto.setSkillName(r.getSkill().getSkillName());
        }

        if (r.getAuthor() != null) {
            dto.setAuthorId(r.getAuthor().getEmployeeId());
            dto.setAuthorName(r.getAuthor().getFirstName() + " " + r.getAuthor().getLastName());
        }

        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
