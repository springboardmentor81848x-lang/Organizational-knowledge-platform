package com.orgskills.intelligence.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The answer to a sign-up: no tokens, because the account is not usable until somebody with the
 * authority to do so grants it access. The message names who was asked, so the applicant knows
 * where their request went and who to chase.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupResponse {

    private String email;

    private String message;
}
