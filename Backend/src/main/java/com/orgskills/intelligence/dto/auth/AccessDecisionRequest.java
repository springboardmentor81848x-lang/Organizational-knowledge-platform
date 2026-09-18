package com.orgskills.intelligence.dto.auth;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * An approver's decision on a sign-up.
 *
 * <p>The note is optional on an approval and worth insisting on in spirit for a refusal: it is
 * shown to the applicant, who otherwise learns only that they were turned down.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessDecisionRequest {

    @Size(max = 1000, message = "A decision note must be 1000 characters or fewer")
    private String note;
}
