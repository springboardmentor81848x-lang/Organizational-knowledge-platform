package com.team7.knowledge_gap_platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.MentorProfile;
import com.team7.knowledge_gap_platform.repository.MentorProfileRepository;

@Service
public class MentorProfileService {

    private final MentorProfileRepository repository;

    public MentorProfileService(MentorProfileRepository repository) {
        this.repository = repository;
    }

    public MentorProfile create(MentorProfile profile) {
        return repository.save(profile);
    }

    public List<MentorProfile> getAll() {
        return repository.findAll();
    }

    public MentorProfile getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Mentor profile not found"));
    }

    public List<MentorProfile> search(String expertise) {
        return repository.findByExpertiseContainingIgnoreCase(expertise);
    }
}