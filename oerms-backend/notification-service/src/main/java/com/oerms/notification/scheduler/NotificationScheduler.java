package com.oerms.notification.scheduler;

import com.oerms.notification.service.EmailService;
import com.oerms.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 2 * * ?") // Every day at 2 AM
    public void cleanupOldNotifications() {
        log.info("Starting scheduled cleanup of old notifications");
        notificationService.deleteOldNotifications();
    }

    @Scheduled(fixedDelay = 3600000) // Every hour
    public void retryFailedEmails() {
        log.info("Starting scheduled retry of failed emails");
        emailService.retryFailedEmails();
    }
}