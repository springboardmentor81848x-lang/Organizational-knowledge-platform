package com.orgskills.intelligence.entity.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * What kind of account this is.
 *
 * <p>The roles split into two groups that the platform treats quite differently, which
 * {@link #hasDevelopmentTrack()} is the single place to ask about.
 */
public enum Role {
    EMPLOYEE,
    MANAGER,
    DEPARTMENT_HEAD,
    HR_SPECIALIST,
    HR_ADMIN,
    LND_ADMIN,
    SYSTEM_ADMIN,
    ADMIN;

    /**
     * Roles that hold a job somebody is measured in, and so have skills, gaps and an assessment
     * of their own.
     *
     * <p>A team lead and a department head are on this list because they are still practitioners
     * with a role to grow into - managing people does not stop somebody having skills. The
     * accounts that are missing are the ones that exist to operate the platform rather than to
     * work in the business: a system administrator maintains the service, an L&amp;D
     * administrator runs the catalogue, an HR administrator manages accounts. Asking them to
     * sit a target-role assessment measures nothing, and it is worse than merely pointless -
     * the assessment writes proficiency rows, so an administrator who took one would appear as
     * a data point in the workforce heatmap and skew figures about a workforce they are not
     * part of.
     */
    private static final Set<Role> DEVELOPMENT_TRACK_ROLES = EnumSet.of(
            EMPLOYEE, MANAGER, DEPARTMENT_HEAD, HR_SPECIALIST);

    /**
     * Whether this role has a personal development track: a target role, an assessment, skills,
     * gaps, recommendations and a learning path.
     *
     * <p>Roles without one are not shown those screens and are refused the endpoints behind
     * them, so an administrator account is never nagged for a target role it cannot have and
     * never appears in a capability figure it would distort.
     */
    public boolean hasDevelopmentTrack() {
        return DEVELOPMENT_TRACK_ROLES.contains(this);
    }
}
