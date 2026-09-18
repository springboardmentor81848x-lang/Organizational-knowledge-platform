package com.orgskills.intelligence.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * One endpoint and the roles that may call it.
 *
 * <p>Read from the {@code @PreAuthorize} annotations on the running application rather than
 * written down separately. There is no permission table in this system - authorization is those
 * annotations - so any hand-maintained list of who may do what would be a second, unenforced
 * account of the rules, free to drift from the one that actually decides requests.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EndpointPermissionResponse {

    /** The area the endpoint belongs to, taken from the first segment after /api. */
    private String area;

    private String method;

    private String path;

    /** Roles the rule admits. Empty when the rule is not a plain role check - see rawRule. */
    private List<String> roles;

    /**
     * True when the endpoint requires only that the caller is signed in, whatever their role.
     */
    private boolean anyAuthenticated;

    /**
     * True when the rule also admits the subject themselves, regardless of role - the pattern
     * used by endpoints somebody may call about their own record.
     */
    private boolean selfPermitted;

    /** The expression exactly as written on the method, so nothing is hidden by the summary. */
    private String rawRule;
}
