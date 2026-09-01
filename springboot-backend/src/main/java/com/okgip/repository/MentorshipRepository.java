package com.okgip.repository;

import com.okgip.entity.Mentorship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MentorshipRepository extends JpaRepository<Mentorship, Long> {
    List<Mentorship> findByMenteeId(Long menteeId);
    List<Mentorship> findByMentorId(Long mentorId);
    List<Mentorship> findByStatus(String status);
    List<Mentorship> findByMenteeIdOrMentorId(Long menteeId, Long mentorId);
}
