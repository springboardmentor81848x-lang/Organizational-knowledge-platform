package com.orgskills.intelligence.dto.session;

import com.orgskills.intelligence.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceEntry {

    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus attendanceStatus;
}
