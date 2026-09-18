package com.orgskills.intelligence.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemHealthResponse {
    private String status;
    private long activeUserCount;
    private long totalUserCount;
    private String databaseStatus;
    private Instant timestamp;
}
