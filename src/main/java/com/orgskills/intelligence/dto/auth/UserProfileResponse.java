package com.orgskills.intelligence.dto.auth;

import com.orgskills.intelligence.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String department;
    private String jobTitle;
    private String avatarUrl;

    /**
     * The role the person is working towards. Their assessments and gap analysis are measured
     * against this profile rather than {@link #jobTitle}, and the employee dashboard shows it,
     * so it travels with every profile read. Null for accounts that never chose one.
     */
    private String targetJobTitle;

    private String targetDepartment;

    /** Whether the address was proven with the emailed code. Always true for seeded accounts. */
    /** Where the account stands with the people who grant access: PENDING, APPROVED or REJECTED. */
    private String accessStatus;

    /** Whether the account may be used at all. Deactivating blocks sign-in and every request. */
    private Boolean active;
}
