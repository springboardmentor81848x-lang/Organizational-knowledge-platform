package com.orgskills.intelligence.dto.employee;

import com.orgskills.intelligence.entity.enums.CertificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String name;
    private String issuer;
    private LocalDate issuedAt;
    private LocalDate expiresAt;
    private CertificationStatus status;
}
