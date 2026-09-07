package com.okip.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.MentorshipRequest;
import com.okip.enums.MentorshipStatus;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByMenteeOrderByCreatedAtDesc(Employee mentee);
    List<MentorshipRequest> findByMentorOrderByCreatedAtDesc(Employee mentor);
    List<MentorshipRequest> findByMentorAndStatusOrderByCreatedAtDesc(Employee mentor, MentorshipStatus status);
    List<MentorshipRequest> findByMenteeAndStatusOrderByCreatedAtDesc(Employee mentee, MentorshipStatus status);
    
    boolean existsByMenteeAndMentorAndStatus(Employee mentee, Employee mentor, MentorshipStatus status);
    boolean existsByMenteeAndMentorAndSkillAndStatus(Employee mentee, Employee mentor, Skill skill, MentorshipStatus status);

    @Query("SELECT r FROM MentorshipRequest r WHERE (r.mentee = :employee OR r.mentor = :employee) AND r.status = 'ACCEPTED'")
    List<MentorshipRequest> findActiveMentorshipsForEmployee(@Param("employee") Employee employee);
}
