package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.MentorExpertise;

@Repository
public interface MentorExpertiseRepository
        extends JpaRepository<MentorExpertise, Long> {

    List<MentorExpertise> findByMentorId(Long mentorId);

    Optional<MentorExpertise> findByMentorIdAndSkillId(
            Long mentorId,
            Long skillId);

    boolean existsByMentorIdAndSkillId(
            Long mentorId,
            Long skillId);

    long countByMentorId(Long mentorId);
}