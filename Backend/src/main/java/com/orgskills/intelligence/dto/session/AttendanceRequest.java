package com.orgskills.intelligence.dto.session;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequest {

    @NotEmpty(message = "At least one attendance entry is required")
    @Valid
    private List<AttendanceEntry> entries;
}
