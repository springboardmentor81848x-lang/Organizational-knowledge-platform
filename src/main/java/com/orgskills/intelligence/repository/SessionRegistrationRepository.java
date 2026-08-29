package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.SessionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SessionRegistrationRepository extends JpaRepository<SessionRegistration, Long> {
    List<SessionRegistration> findBySessionIdOrderByRegisteredAtAsc(Long sessionId);

    List<SessionRegistration> findBySessionIdIn(Collection<Long> sessionIds);

    List<SessionRegistration> findByEmployeeId(Long employeeId);

    Optional<SessionRegistration> findBySessionIdAndEmployeeId(Long sessionId, Long employeeId);

    long countBySessionId(Long sessionId);

    boolean existsBySessionId(Long sessionId);

    /**
     * Mean attendee feedback for the sessions each of these employees hosted, used by the
     * expert directory as a "prior mentorship rating" tie-breaker. Aggregated in the database
     * so ranking a directory search costs one extra query regardless of how many experts match.
     */
    @Query("""
            SELECT ks.mentor.id AS mentorId,
                   AVG(sr.feedbackRating) AS averageRating,
                   COUNT(sr.feedbackRating) AS ratingCount
            FROM SessionRegistration sr
            JOIN sr.session ks
            WHERE ks.mentor.id IN :mentorIds
              AND sr.feedbackRating IS NOT NULL
            GROUP BY ks.mentor.id
            """)
    List<HostRatingAggregate> findHostRatingsByMentorIds(@Param("mentorIds") Collection<Long> mentorIds);

    /** Projection for {@link #findHostRatingsByMentorIds(Collection)}. */
    interface HostRatingAggregate {
        Long getMentorId();

        Double getAverageRating();

        Long getRatingCount();
    }
}
