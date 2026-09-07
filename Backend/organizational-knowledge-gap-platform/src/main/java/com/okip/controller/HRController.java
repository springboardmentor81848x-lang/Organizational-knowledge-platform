package com.okip.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.hr.ApprovedEmployeeDTO;
import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.PendingEmployeeDTO;
import com.okip.service.hr.HRService;

@RestController
@RequestMapping("/api/hr")
public class HRController {

    private final HRService hrService;

    public HRController(HRService hrService) {
        this.hrService = hrService;
    }

    @PutMapping("/approve/{employeeId}")
    public ResponseEntity<EmployeeApprovalResponseDTO> approveEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                hrService.approveEmployee(employeeId));
    }
    
    @PutMapping("/reject/{employeeId}")
    public ResponseEntity<EmployeeApprovalResponseDTO> rejectEmployee(
            @PathVariable Long employeeId) {

        EmployeeApprovalResponseDTO response =
                hrService.rejectEmployee(employeeId);

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<PendingEmployeeDTO>> getPendingEmployees() {

        return ResponseEntity.ok(
                hrService.getPendingEmployees());
    }

    @GetMapping("/employees")
    public ResponseEntity<List<ApprovedEmployeeDTO>> getAllEmployees() {

        return ResponseEntity.ok(
                hrService.getAllApprovedEmployees());
    }
}