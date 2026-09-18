package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Mentorship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MentorshipRepository
        extends JpaRepository<Mentorship, Long> {

    List<Mentorship> findByMentee(Employee mentee);

    List<Mentorship> findByMentor(Employee mentor);

    List<Mentorship> findByMenteeAndStatus(
            Employee mentee,
            String status
    );

    List<Mentorship> findByMentorAndStatus(
            Employee mentor,
            String status
    );

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Mentorship m WHERE (m.mentee = :employee OR m.mentor = :employee) AND UPPER(m.status) IN ('ACCEPTED', 'ACTIVE')")
    List<Mentorship> findActivePeerMentorships(
            @org.springframework.data.repository.query.Param("employee") Employee employee
    );
}