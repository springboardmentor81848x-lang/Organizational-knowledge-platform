package com.orgskills.intelligence.service;

import com.orgskills.intelligence.config.CacheNames;
import com.orgskills.intelligence.dto.skill.SkillRequest;
import com.orgskills.intelligence.dto.skill.SkillResponse;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    /**
     * The skill catalogue: read on nearly every screen, written only when an administrator
     * edits it, which makes it the clearest caching win in the application.
     *
     * <p>The key is normalised rather than left to the default generator for two reasons. A
     * null category and a blank one mean the same thing to the query below, and the lookup
     * itself ignores case, so "Java" and "java" must not occupy two entries holding identical
     * rows. Without this, the default key for the no-filter call is also the unreadable
     * {@code SimpleKey [null]}.
     */
    @Cacheable(value = CacheNames.CATALOG_SKILLS,
            key = "(#category == null or #category.isBlank()) ? 'all' : #category.trim().toLowerCase()")
    public List<SkillResponse> getAllSkills(String category) {
        List<Skill> skills;
        if (category != null && !category.isBlank()) {
            skills = skillRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            skills = skillRepository.findAll();
        }
        return skills.stream().map(this::toResponse).toList();
    }

    public SkillResponse getById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + id));
        return toResponse(skill);
    }

    /**
     * Every write clears the whole catalogue cache rather than one key: the category filter
     * means a single skill is held under both 'all' and its own category, and renaming a
     * category moves it between entries that a targeted eviction could not name. The analytics
     * caches go too, because the heatmap's columns are the skill list.
     */
    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATALOG_SKILLS, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_TEAM_GAP_HEATMAP, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_DEPARTMENT_COVERAGE, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_ORGANIZATION_GAP, allEntries = true)
    })
    @Transactional
    public SkillResponse create(SkillRequest request) {
        if (skillRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new ValidationException("Skill with name '" + request.getName() + "' already exists");
        }
        Skill skill = new Skill();
        skill.setName(request.getName().trim());
        skill.setCategory(request.getCategory().trim());
        skill.setDescription(request.getDescription());
        return toResponse(skillRepository.save(skill));
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATALOG_SKILLS, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_TEAM_GAP_HEATMAP, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_DEPARTMENT_COVERAGE, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_ORGANIZATION_GAP, allEntries = true)
    })
    @Transactional
    public SkillResponse update(Long id, SkillRequest request) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + id));
        skillRepository.findByNameIgnoreCase(request.getName().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ValidationException("Skill with name '" + request.getName() + "' already exists");
                });
        skill.setName(request.getName().trim());
        skill.setCategory(request.getCategory().trim());
        skill.setDescription(request.getDescription());
        return toResponse(skillRepository.save(skill));
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATALOG_SKILLS, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_TEAM_GAP_HEATMAP, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_DEPARTMENT_COVERAGE, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_ORGANIZATION_GAP, allEntries = true)
    })
    @Transactional
    public void delete(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill not found for id: " + id);
        }
        skillRepository.deleteById(id);
    }

    private SkillResponse toResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .build();
    }
}
