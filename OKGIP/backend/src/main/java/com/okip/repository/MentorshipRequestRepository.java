package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.MentorshipRequest;

public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {

    List<MentorshipRequest> findByMenteeOrMentorOrderByCreatedAtDesc(Employee mentee, Employee mentor);

    List<MentorshipRequest> findByMenteeOrderByCreatedAtDesc(Employee mentee);

    List<MentorshipRequest> findByMentorOrderByCreatedAtDesc(Employee mentor);

    Optional<MentorshipRequest> findByMenteeAndMentorAndSkillAndStatusIn(
            Employee mentee, Employee mentor, Skill skill, List<MentorshipRequest.Status> statuses);
}
