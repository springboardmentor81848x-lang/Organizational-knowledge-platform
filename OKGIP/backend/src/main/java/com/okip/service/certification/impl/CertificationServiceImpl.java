package com.okip.service.certification.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.certification.AddCertificationRequestDTO;
import com.okip.dto.certification.CertificationResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Certification;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.CertificationRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.service.certification.CertificationService;
import com.okip.service.notification.NotificationService;

@Service
public class CertificationServiceImpl
        implements CertificationService {

    private final EmployeeRepository employeeRepository;
    private final CertificationRepository certificationRepository;
    private final NotificationService notificationService;

    public CertificationServiceImpl(
            EmployeeRepository employeeRepository,
            CertificationRepository certificationRepository,
            NotificationService notificationService) {

        this.employeeRepository = employeeRepository;
        this.certificationRepository = certificationRepository;
        this.notificationService = notificationService;
    }

    @Override
    public CertificationResponseDTO addCertification(
            AddCertificationRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Certification certification =
                new Certification();

        certification.setEmployee(employee);
        certification.setCertificateName(
                request.getCertificateName());

        certification.setIssuingOrganization(
                request.getIssuingOrganization());

        certification.setIssueDate(
                request.getIssueDate());

        certification.setExpiryDate(
                request.getExpiryDate());

        certification.setCredentialId(
                request.getCredentialId());

        certification.setCredentialUrl(
                request.getCredentialUrl());

        certification.setCertificateFilePath(
                request.getCertificateFilePath());

        certification =
                certificationRepository.save(
                        certification);
        notificationService.notifyEmployee(employee.getEmployeeId(), "CERTIFICATE_ADDED", "Certification Added", certification.getCertificateName() + " was added to your profile.", "/employee/certifications");
        return buildResponse(certification);
    }

    @Override
    public List<CertificationResponseDTO>
            getMyCertifications() {

        Employee employee =
                getLoggedInEmployee();

        List<Certification> certifications =
                certificationRepository.findByEmployee(
                        employee);

        List<CertificationResponseDTO> response =
                new ArrayList<>();

        for (Certification certification
                : certifications) {

            response.add(
                    buildResponse(certification));
        }

        return response;
    }

    @Override
    public CertificationResponseDTO updateCertification(
            Long certificationId,
            AddCertificationRequestDTO request) {

        Employee employee =
                getLoggedInEmployee();

        Certification certification =
                certificationRepository
                        .findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found."));

        if (!certification.getEmployee()
                .getEmployeeId()
                .equals(employee.getEmployeeId())) {

            throw new ResourceNotFoundException(
                    "Certification not found.");
        }

        certification.setCertificateName(
                request.getCertificateName());

        certification.setIssuingOrganization(
                request.getIssuingOrganization());

        certification.setIssueDate(
                request.getIssueDate());

        certification.setExpiryDate(
                request.getExpiryDate());

        certification.setCredentialId(
                request.getCredentialId());

        certification.setCredentialUrl(
                request.getCredentialUrl());

        certification.setCertificateFilePath(
                request.getCertificateFilePath());

        certification =
                certificationRepository.save(
                        certification);

        return buildResponse(certification);
    }

    @Override
    public void deleteCertification(
            Long certificationId) {

        Employee employee =
                getLoggedInEmployee();

        Certification certification =
                certificationRepository
                        .findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found."));

        if (!certification.getEmployee()
                .getEmployeeId()
                .equals(employee.getEmployeeId())) {

            throw new ResourceNotFoundException(
                    "Certification not found.");
        }

        certificationRepository.delete(
                certification);
    }

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
    }

    private CertificationResponseDTO buildResponse(
            Certification certification) {

        CertificationResponseDTO response =
                new CertificationResponseDTO();

        response.setCertificationId(
                certification.getCertificationId());

        response.setEmployeeCode(
                certification.getEmployee()
                        .getEmployeeCode());

        response.setCertificateName(
                certification.getCertificateName());

        response.setIssuingOrganization(
                certification.getIssuingOrganization());

        response.setIssueDate(
                certification.getIssueDate());

        response.setExpiryDate(
                certification.getExpiryDate());

        response.setCredentialId(
                certification.getCredentialId());

        response.setCredentialUrl(
                certification.getCredentialUrl());

        response.setCertificateFilePath(
                certification.getCertificateFilePath());

        return response;
    }
}