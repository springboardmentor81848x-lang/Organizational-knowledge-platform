package com.okip.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.KnowledgeResource;
import com.okip.enums.ResourceType;

@Repository
public interface KnowledgeResourceRepository extends JpaRepository<KnowledgeResource, Long> {
    List<KnowledgeResource> findBySkill(Skill skill);
    List<KnowledgeResource> findByResourceType(ResourceType resourceType);
    List<KnowledgeResource> findBySkillAndResourceType(Skill skill, ResourceType resourceType);
    List<KnowledgeResource> findAllByOrderByCreatedAtDesc();
}
