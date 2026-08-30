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

    /** Whether the account may be used at all. Deactivating blocks sign-in and every request. */
    private Boolean active;
}
