package com.knowledgeiq.service;

import com.knowledgeiq.dto.SkillDto;
import com.knowledgeiq.model.Role;
import com.knowledgeiq.model.RoleSkillBenchmark;
import com.knowledgeiq.repository.RoleRepository;
import com.knowledgeiq.repository.RoleSkillBenchmarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompetencyService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    public List<SkillDto> getCompetencyFrameworkForRole(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        List<RoleSkillBenchmark> benchmarks = benchmarkRepository.findByRoleId(roleId);

        return benchmarks.stream().map(bm -> new SkillDto(
                bm.getSkill().getId(),
                bm.getSkill().getName(),
                bm.getSkill().getCategory() != null ? bm.getSkill().getCategory().getName() : "General",
                "N/A",
                String.valueOf(bm.getRequiredLevel()),
                bm.getIsCritical()
        )).collect(Collectors.toList());
    }
}
