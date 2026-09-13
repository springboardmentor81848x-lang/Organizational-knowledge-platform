package com.orgskills.intelligence.dto.role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One role a new employee can aim at, as offered on the sign-up form.
 *
 * <p>These are not free text. A target role is only meaningful if there is a competency profile
 * to measure against, so the list is derived from the profiles that actually exist - which is
 * why the skill count travels with it. Letting somebody type "Senior Architect" when no such
 * profile is defined would produce an account whose assessment has no questions and whose gap
 * analysis can never run.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TargetRoleOption {

    private String jobTitle;

    private String department;

    /** How many skills the role is measured on; also the length of its assessment. */
    private Integer skillCount;
}
