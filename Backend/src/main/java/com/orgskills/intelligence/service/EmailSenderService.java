package com.orgskills.intelligence.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the platform's outbound email, and stays usable when there is no mail server to send it
 * with.
 *
 * <p>Spring Boot always registers a {@link JavaMailSender} once the mail starter is on the
 * classpath, whether or not a host was configured, so its presence proves nothing. This class
 * decides on the configured host instead: with one, mail is really sent; without one, the
 * message is written to the log and the send reports itself as not delivered.
 *
 * <p>That fallback is what lets sign-up be exercised on a fresh checkout with no credentials -
 * the code is in the server log - while the same code path sends real email the moment
 * {@code MAIL_HOST} is set. The alternative, failing sign-up outright when SMTP is absent, would
 * make the feature untestable until somebody produced an app password.
 *
 * <p>A failed send is never allowed to propagate. The one-time password is already saved by the
 * time this runs, so letting a refused SMTP connection roll the sign-up back would lose the
 * account and tell the user only that something broke.
 */
@Service
@Slf4j
public class EmailSenderService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;
    private final boolean smtpConfigured;

    public EmailSenderService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.mail.from:no-reply@orgskills.com}") String fromAddress) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
        this.smtpConfigured = mailHost != null && !mailHost.isBlank();
        if (smtpConfigured) {
            log.info("Email delivery is enabled via SMTP host {}", mailHost);
        } else {
            log.warn("No SMTP host configured (spring.mail.host is empty). Outbound email will be "
                    + "written to this log instead of sent. Set MAIL_HOST, MAIL_USERNAME and "
                    + "MAIL_PASSWORD to deliver for real.");
        }
    }

    /** Whether a real mail server is configured. Sign-up uses this to decide what to tell the caller. */
    public boolean isDeliveryConfigured() {
        return smtpConfigured;
    }

    /**
     * Sends a plain-text message.
     *
     * @return true when it was handed to a mail server, false when it was only logged or the
     *         send failed. Callers use this to shape their response rather than to decide
     *         whether the surrounding operation succeeded.
     */
    public boolean send(String to, String subject, String body) {
        if (!smtpConfigured) {
            log.info("""

                    ┌─ EMAIL (not sent - no SMTP configured) ─────────────────────────
                    │ To:      {}
                    │ Subject: {}
                    ├─────────────────────────────────────────────────────────────────
                    {}
                    └─────────────────────────────────────────────────────────────────
                    """, to, subject, body);
            return false;
        }

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.error("SMTP host is configured but no JavaMailSender is available; email to {} was not sent", to);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
            log.info("Email sent to {} with subject '{}'", to, subject);
            return true;
        } catch (Exception ex) {
            // Swallowed on purpose: see the class comment. The caller's work has already been
            // committed and must not be undone by a mail server being unreachable.
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
            return false;
        }
    }
}
