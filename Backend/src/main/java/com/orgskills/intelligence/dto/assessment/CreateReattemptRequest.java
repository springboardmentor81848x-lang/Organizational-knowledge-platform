package com.orgskills.intelligence.dto.assessment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** An employee asking for another attempt. The reason is what the approver decides on. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReattemptRequest {

    @NotBlank(message = "A reason is required so the approver has something to decide on")
    @Size(max = 1000, message = "Keep the reason under 1000 characters")
    private String reason;
}
