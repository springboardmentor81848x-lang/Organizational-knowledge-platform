package com.okip.service.hr;

import java.util.List;

import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.PendingEmployeeDTO;

public interface HRService {

    EmployeeApprovalResponseDTO approveEmployee(Long employeeId);
    
    EmployeeApprovalResponseDTO rejectEmployee(Long employeeId);
    
    List<PendingEmployeeDTO> getPendingEmployees();

}