package com.orgskills.intelligence.dto.assessment;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** An approver's note alongside an approval or a refusal. Optional either way. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReattemptDecisionRequest {

    @Size(max = 1000, message = "Keep the note under 1000 characters")
    private String note;
}
