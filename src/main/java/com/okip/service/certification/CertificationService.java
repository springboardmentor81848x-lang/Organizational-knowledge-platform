package com.okip.service.certification;

import java.util.List;

import com.okip.dto.certification.AddCertificationRequestDTO;
import com.okip.dto.certification.CertificationResponseDTO;

public interface CertificationService {

    CertificationResponseDTO addCertification(
            AddCertificationRequestDTO request);

    List<CertificationResponseDTO> getMyCertifications();

    CertificationResponseDTO updateCertification(
            Long certificationId,
            AddCertificationRequestDTO request);

    void deleteCertification(
            Long certificationId);

}