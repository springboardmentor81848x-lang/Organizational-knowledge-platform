package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AccessStatus;
import com.orgskills.intelligence.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByDepartmentIgnoreCase(String department);

    List<User> findByManagerId(Long managerId);

    /** Everyone holding one of the given roles; used to route an approval request to HR. */
    List<User> findByRoleIn(Collection<Role> roles);

    /**
     * Sign-ups in a given state, oldest first.
     *
     * <p>Oldest first because this backs a queue somebody works through: the person who has been
     * waiting longest should be the next one dealt with.
     */
    List<User> findByAccessStatusOrderByIdAsc(AccessStatus accessStatus);

    /** Department heads of one department, who are the first people a sign-up there is routed to. */
    List<User> findByRoleAndDepartmentIgnoreCase(Role role, String department);

    /**
     * The people directory, with every filter optional.
     *
     * <h2>Why the string parameters are cast explicitly</h2>
     * {@code LOWER(:query)} gives PostgreSQL no way to infer what type the parameter is - unlike
     * {@code u.role = :role}, where the column on the other side of the comparison settles it.
     * Passing null for an untyped parameter makes the driver send it as {@code bytea}, and
     * PostgreSQL then rejects the whole statement with "function lower(bytea) does not exist".
     * The CAST is what tells it these are strings.
     *
     * <p>This failed only on PostgreSQL. H2 - which the test suite runs on - infers the type
     * happily and returns the right rows, so the entire suite passed while
     * {@code GET /api/hr/employees} answered 500 on the real database for every caller who did
     * not supply a search term, which is the default way the screen loads.
     */
    @Query("SELECT u FROM User u WHERE " +
           "(CAST(:query AS string) IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) AND " +
           "(CAST(:department AS string) IS NULL OR LOWER(u.department) = LOWER(CAST(:department AS string))) AND " +
           "(:role IS NULL OR u.role = :role)")
    List<User> searchUsers(@Param("query") String query,
                           @Param("department") String department,
                           @Param("role") Role role);

    long countByActiveTrue();
}
