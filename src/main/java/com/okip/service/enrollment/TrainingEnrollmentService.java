package com.okip.service.enrollment;

import java.util.List;
import com.okip.dto.enrollment.TrainingEnrollmentRequestDTO;
import com.okip.dto.enrollment.TrainingEnrollmentResponseDTO;
import com.okip.dto.enrollment.TrainingProgressRequestDTO;

public interface TrainingEnrollmentService {

    TrainingEnrollmentResponseDTO enroll(
            TrainingEnrollmentRequestDTO request);

    List<TrainingEnrollmentResponseDTO> getMyEnrollments();

    TrainingEnrollmentResponseDTO updateProgress(
            Long enrollmentId,
            TrainingProgressRequestDTO request);

    List<TrainingEnrollmentResponseDTO> getAllEnrollments();

    List<TrainingEnrollmentResponseDTO> getEmployeeEnrollments(Long employeeId);

    List<TrainingEnrollmentResponseDTO> getTeamEnrollments();
}
