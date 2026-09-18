package com.orgskills.intelligence.scheduler;

import com.orgskills.intelligence.dto.gap.OrgGapMetricsResponse;
import com.orgskills.intelligence.entity.Certification;
import com.orgskills.intelligence.entity.GapSnapshot;
import com.orgskills.intelligence.entity.enums.CertificationStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.repository.CertificationRepository;
import com.orgskills.intelligence.repository.GapSnapshotRepository;
import com.orgskills.intelligence.service.AuditLogService;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.NotificationReminderService;
import com.orgskills.intelligence.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final CertificationRepository certificationRepository;
    private final GapSnapshotRepository gapSnapshotRepository;
    private final NotificationService notificationService;
    private final GapAnalysisService gapAnalysisService;
    private final AuditLogService auditLogService;
    private final NotificationReminderService notificationReminderService;

    // Daily certification expiry check at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void scanCertificationExpiries() {
        log.info("Running scheduled daily certification expiry scan...");
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);

        List<Certification> expiringSoon = certificationRepository.findByExpiresAtBetween(LocalDate.now(), thirtyDaysFromNow);
        for (Certification cert : expiringSoon) {
            if (cert.getStatus() == CertificationStatus.ACTIVE) {
                cert.setStatus(CertificationStatus.EXPIRING_SOON);
                certificationRepository.save(cert);

                notificationService.createNotification(
                        cert.getEmployee(),
                        "Certification Expiring Soon",
                        "Your certification '" + cert.getName() + "' is expiring on " + cert.getExpiresAt() + ". Please prepare for renewal.",
                        NotificationType.SYSTEM_ALERT
                );
                auditLogService.logEvent(null, "SCHEDULER", "CERTIFICATION_EXPIRING_SOON", "Certification", cert.getId().toString(), "Flagged certification expiring on " + cert.getExpiresAt());
            }
        }
    }

    // Daily reminder scans at 6:00 AM, before the working day starts.
    @Scheduled(cron = "0 0 6 * * ?")
    public void sendDailyReminders() {
        log.info("Running scheduled daily reminder scans...");
        runScan("training deadline", notificationReminderService::sendTrainingDeadlineReminders);
        runScan("session", notificationReminderService::sendSessionReminders);
        runScan("assessment due", notificationReminderService::sendAssessmentReminders);
    }

    /** One failing scan must not stop the others: they are independent reminders. */
    private void runScan(String name, java.util.function.IntSupplier scan) {
        try {
            log.info("Sent {} {} reminder(s).", scan.getAsInt(), name);
        } catch (Exception ex) {
            log.error("The {} reminder scan failed: {}", name, ex.getMessage(), ex);
        }
    }

    // Weekly gap snapshot creation at Sunday midnight
    @Scheduled(cron = "0 0 0 * * SUN")
    @Transactional
    public void recordWeeklyGapSnapshots() {
        log.info("Recording weekly gap snapshot trends...");
        try {
            OrgGapMetricsResponse orgMetrics = gapAnalysisService.getOrgGapMetrics();

            GapSnapshot orgSnapshot = new GapSnapshot();
            orgSnapshot.setSnapshotDate(LocalDate.now());
            orgSnapshot.setDepartment("ALL");
            orgSnapshot.setTotalGaps((int) orgMetrics.getTotalAnalyzedGaps());
            orgSnapshot.setCriticalGapsCount(orgMetrics.getRiskDistribution().getOrDefault("CRITICAL", 0L).intValue());
            orgSnapshot.setHighGapsCount(orgMetrics.getRiskDistribution().getOrDefault("HIGH", 0L).intValue());
            orgSnapshot.setMediumGapsCount(orgMetrics.getRiskDistribution().getOrDefault("MEDIUM", 0L).intValue());
            orgSnapshot.setLowGapsCount(orgMetrics.getRiskDistribution().getOrDefault("LOW", 0L).intValue());
            orgSnapshot.setAvgGapScore(orgMetrics.getOverallAverageGapScore());

            gapSnapshotRepository.save(orgSnapshot);
            log.info("Weekly gap snapshot saved successfully.");
        } catch (Exception ex) {
            log.error("Failed to record weekly gap snapshot: {}", ex.getMessage(), ex);
        }
    }
}
