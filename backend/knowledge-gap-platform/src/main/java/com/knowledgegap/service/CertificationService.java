package com.knowledgegap.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Certification;
import com.knowledgegap.entity.CertificationStatus;
import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.CertificationRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class CertificationService {

    private final CertificationRepository certificationRepository;

    private final EmployeeService employeeService;

    private final CourseService courseService;

    private final TrainingEnrollmentRepository enrollmentRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CertificationService(
            CertificationRepository certificationRepository,
            EmployeeService employeeService,
            CourseService courseService,
            TrainingEnrollmentRepository enrollmentRepository) {

        this.certificationRepository =
                certificationRepository;

        this.employeeService =
                employeeService;

        this.courseService =
                courseService;

        this.enrollmentRepository =
                enrollmentRepository;
    }

    // =========================================================
    // CREATE CERTIFICATION
    // =========================================================

    @Transactional
    public Certification createCertification(
            String employeeIdentifier,
            Long courseId,
            String certificateName,
            String certificateNumber,
            LocalDate issueDate,
            LocalDate expiryDate) {

        Employee employee =
                employeeService
                        .getEmployeeByIdentifier(
                                employeeIdentifier
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        Course course =
                courseService.getCourseById(courseId);

        // -----------------------------------------------------
        // CHECK TRAINING ENROLLMENT
        // -----------------------------------------------------

        TrainingEnrollment enrollment =
                enrollmentRepository
                        .findByEmployeeAndCourse(
                                employee,
                                course
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Employee is not enrolled in this course."
                                )
                        );

        // -----------------------------------------------------
        // TRAINING MUST BE COMPLETED
        // -----------------------------------------------------

        if (
                enrollment.getStatus() !=
                        TrainingStatus.COMPLETED
                &&
                enrollment.getStatus() !=
                        TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "Training must be completed before certification."
            );
        }

        // -----------------------------------------------------
        // CHECK DUPLICATE CERTIFICATION
        // -----------------------------------------------------

        if (
                certificationRepository
                        .findByEmployeeAndCourse(
                                employee,
                                course
                        )
                        .isPresent()
        ) {

            throw new IllegalStateException(
                    "Employee already has a certification for this course."
            );
        }

        // -----------------------------------------------------
        // VALIDATE DATES
        // -----------------------------------------------------

        if (issueDate == null) {
            issueDate = LocalDate.now();
        }

        if (
                expiryDate != null
                &&
                expiryDate.isBefore(issueDate)
        ) {

            throw new IllegalArgumentException(
                    "Expiry date cannot be before issue date."
            );
        }

        // -----------------------------------------------------
        // CREATE CERTIFICATION
        // -----------------------------------------------------

        Certification certification =
                new Certification();

        certification.setEmployee(employee);

        certification.setCourse(course);

        certification.setCertificateName(
                certificateName
        );

        certification.setCertificateNumber(
                certificateNumber
        );

        certification.setIssueDate(
                issueDate
        );

        certification.setExpiryDate(
                expiryDate
        );

        certification.setStatus(
                CertificationStatus.ACTIVE
        );

        Certification saved =
                certificationRepository.save(
                        certification
                );

        // -----------------------------------------------------
        // UPDATE TRAINING STATUS
        // -----------------------------------------------------

        enrollment.setStatus(
                TrainingStatus.CERTIFIED
        );

        enrollmentRepository.save(enrollment);

        return saved;
    }

    // =========================================================
    // GET EMPLOYEE CERTIFICATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Certification> getEmployeeCertifications(
            String employeeIdentifier) {

        Employee employee =
                employeeService
                        .getEmployeeByIdentifier(
                                employeeIdentifier
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        return certificationRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // GET SINGLE CERTIFICATION
    // =========================================================

    @Transactional(readOnly = true)
    public Certification getCertificationById(
            Long certificationId) {

        return certificationRepository
                .findById(certificationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Certification not found with id: "
                                        + certificationId
                        )
                );
    }

    // =========================================================
    // MARK EXPIRED
    // =========================================================

    @Transactional
    public Certification markExpired(
            Long certificationId) {

        Certification certification =
                getCertificationById(
                        certificationId
                );

        certification.setStatus(
                CertificationStatus.EXPIRED
        );

        return certificationRepository.save(
                certification
        );
    }

    // =========================================================
    // MARK RENEWAL REQUIRED
    // =========================================================

    @Transactional
    public Certification markRenewalRequired(
            Long certificationId) {

        Certification certification =
                getCertificationById(
                        certificationId
                );

        certification.setStatus(
                CertificationStatus.RENEWAL_REQUIRED
        );

        return certificationRepository.save(
                certification
        );
    }

    // =========================================================
    // RENEW CERTIFICATION
    // =========================================================

    @Transactional
    public Certification renewCertification(
            Long certificationId,
            LocalDate issueDate,
            LocalDate expiryDate) {

        Certification certification =
                getCertificationById(
                        certificationId
                );

        if (issueDate == null) {
            issueDate = LocalDate.now();
        }

        if (
                expiryDate != null
                &&
                expiryDate.isBefore(issueDate)
        ) {

            throw new IllegalArgumentException(
                    "Expiry date cannot be before issue date."
            );
        }

        certification.setIssueDate(
                issueDate
        );

        certification.setExpiryDate(
                expiryDate
        );

        certification.setStatus(
                CertificationStatus.ACTIVE
        );

        return certificationRepository.save(
                certification
        );
    }

    // =========================================================
    // AUTOMATIC EXPIRY CHECK
    // =========================================================

    @Transactional
    public void updateExpiredCertifications() {

        List<Certification> certifications =
                certificationRepository.findAll();

        LocalDate today = LocalDate.now();

        for (Certification certification : certifications) {

            LocalDate expiryDate =
                    certification.getExpiryDate();

            if (
                    expiryDate != null
                    &&
                    expiryDate.isBefore(today)
                    &&
                    certification.getStatus()
                            == CertificationStatus.ACTIVE
            ) {

                certification.setStatus(
                        CertificationStatus.EXPIRED
                );

                certificationRepository.save(
                        certification
                );
            }
        }
    }

    // =========================================================
    // DELETE CERTIFICATION
    // =========================================================

    @Transactional
    public void deleteCertification(
            Long certificationId) {

        if (
                !certificationRepository
                        .existsById(certificationId)
        ) {

            throw new RuntimeException(
                    "Certification not found with id: "
                            + certificationId
            );
        }

        certificationRepository.deleteById(
                certificationId
        );
    }
}