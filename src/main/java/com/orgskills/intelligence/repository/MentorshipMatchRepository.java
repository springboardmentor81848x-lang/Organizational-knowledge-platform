package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MentorshipMatchRepository extends JpaRepository<MentorshipMatch, Long> {
    List<MentorshipMatch> findByMenteeIdOrMentorIdOrderByCreatedAtDesc(Long menteeId, Long mentorId);

    boolean existsByMenteeIdAndTargetSkillIdAndStatus(Long menteeId, Long targetSkillId, MentorshipStatus status);

    boolean existsByMentorIdAndMenteeIdAndTargetSkillIdAndStatus(Long mentorId, Long menteeId, Long targetSkillId,
                                                                 MentorshipStatus status);

    List<MentorshipMatch> findByMentorIdInAndStatusIn(Collection<Long> mentorIds, Collection<MentorshipStatus> statuses);

    List<MentorshipMatch> findByMenteeIdAndStatusOrderByCreatedAtDesc(Long menteeId, MentorshipStatus status);

    List<MentorshipMatch> findByMenteeIdInAndStatus(Collection<Long> menteeIds, MentorshipStatus status);

    long countByStatus(MentorshipStatus status);
}
