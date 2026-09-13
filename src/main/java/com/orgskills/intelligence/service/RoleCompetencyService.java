package com.orgskills.intelligence.service;

import com.orgskills.intelligence.config.CacheNames;
import com.orgskills.intelligence.dto.role.RoleCompetencyRequest;
import com.orgskills.intelligence.dto.role.RoleCompetencyResponse;
import com.orgskills.intelligence.dto.role.TargetRoleOption;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
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
public class RoleCompetencyService {

    private final RoleCompetencyRepository roleCompetencyRepository;
    private final SkillRepository skillRepository;

    /**
     * The required-proficiency matrix behind every gap calculation, so it is read constantly and
     * changed rarely.
     *
     * <p>The key normalises both filters the same way the queries below match them - trimmed and
     * case insensitive - and collapses the partial-filter cases onto the same 'all' entry that
     * the unfiltered call uses, because that is the branch they actually take: the query is only
     * narrowed when both arguments are present.
     */
    @Cacheable(value = CacheNames.CATALOG_COMPETENCIES,
            key = "(#jobTitle == null or #jobTitle.isBlank() or #department == null or #department.isBlank())"
                    + " ? 'all' : #jobTitle.trim().toLowerCase() + '|' + #department.trim().toLowerCase()")
    public List<RoleCompetencyResponse> getCompetencies(String jobTitle, String department) {
        List<RoleCompetency> competencies;
        if (jobTitle != null && !jobTitle.isBlank() && department != null && !department.isBlank()) {
            competencies = roleCompetencyRepository
                    .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(jobTitle.trim(), department.trim());
        } else {
            competencies = roleCompetencyRepository.findAll();
        }
        return competencies.stream().map(this::toResponse).toList();
    }

    /**
     * The analytics caches are evicted alongside the catalogue here, and that is the important
     * half. A competency is the required level a gap is measured against, so changing one moves
     * every gap score computed from it even though not a single user skill was touched.
     */
    /**
     * The target roles a new employee may choose from, for the sign-up form.
     *
     * <p>Shares the competency cache because it is derived from the same rows, so the existing
     * evictions on create, update and delete already keep it correct.
     */
    @Cacheable(value = CacheNames.CATALOG_COMPETENCIES, key = "'target-roles'")
    public List<TargetRoleOption> getTargetRoleOptions() {
        return roleCompetencyRepository.findDistinctTargetRoles();
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATALOG_COMPETENCIES, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_TEAM_GAP_HEATMAP, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_DEPARTMENT_COVERAGE, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_ORGANIZATION_GAP, allEntries = true)
    })
    @Transactional
    public RoleCompetencyResponse create(RoleCompetencyRequest request) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + request.getSkillId()));

        if (roleCompetencyRepository.existsByJobTitleIgnoreCaseAndDepartmentIgnoreCaseAndSkillId(
                request.getJobTitle().trim(), request.getDepartment().trim(), request.getSkillId())) {
            throw new ValidationException("Role competency already exists for this job title, department, and skill combination");
        }

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(request.getJobTitle().trim());
        competency.setDepartment(request.getDepartment().trim());
        competency.setSkill(skill);
        competency.setRequiredProficiencyLevel(request.getRequiredProficiencyLevel());

        return toResponse(roleCompetencyRepository.save(competency));
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATALOG_COMPETENCIES, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_TEAM_GAP_HEATMAP, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_DEPARTMENT_COVERAGE, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_ORGANIZATION_GAP, allEntries = true)
    })
    @Transactional
    public RoleCompetencyResponse update(Long id, RoleCompetencyRequest request) {
        RoleCompetency competency = roleCompetencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role competency not found for id: " + id));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + request.getSkillId()));

        competency.setJobTitle(request.getJobTitle().trim());
        competency.setDepartment(request.getDepartment().trim());
        competency.setSkill(skill);
        competency.setRequiredProficiencyLevel(request.getRequiredProficiencyLevel());

        return toResponse(roleCompetencyRepository.save(competency));
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.CATALOG_COMPETENCIES, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_TEAM_GAP_HEATMAP, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_DEPARTMENT_COVERAGE, allEntries = true),
            @CacheEvict(value = CacheNames.ANALYTICS_ORGANIZATION_GAP, allEntries = true)
    })
    @Transactional
    public void delete(Long id) {
        if (!roleCompetencyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Role competency not found for id: " + id);
        }
        roleCompetencyRepository.deleteById(id);
    }

    private RoleCompetencyResponse toResponse(RoleCompetency competency) {
        return RoleCompetencyResponse.builder()
                .id(competency.getId())
                .jobTitle(competency.getJobTitle())
                .department(competency.getDepartment())
                .skillId(competency.getSkill().getId())
                .skillName(competency.getSkill().getName())
                .requiredProficiencyLevel(competency.getRequiredProficiencyLevel())
                .build();
    }
}
