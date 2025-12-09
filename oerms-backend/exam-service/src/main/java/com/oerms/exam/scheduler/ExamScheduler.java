package com.oerms.exam.scheduler;

import com.oerms.exam.entity.Exam;
import com.oerms.common.enums.ExamStatus;
import com.oerms.exam.repository.ExamRepository;
import com.oerms.exam.service.ExamEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamScheduler {

    private final ExamRepository examRepository;
    private final ExamEventPublisher eventPublisher;

    /**
     * Auto-complete expired exams
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void autoCompleteExpiredExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> expiredExams = examRepository.findExpiredExams(now);
        
        if (expiredExams.isEmpty()) {
            return;
        }
        
        for (Exam exam : expiredExams) {
            try {
                exam.setStatus(ExamStatus.COMPLETED);
                examRepository.save(exam);
                
                // Publish exam completed event
                eventPublisher.publishExamCompleted(exam, null); // null studentId for auto-completion
                
                log.info("Auto-completed expired exam: {} (Title: {})", exam.getId(), exam.getTitle());
            } catch (Exception e) {
                log.error("Failed to auto-complete exam: {}", exam.getId(), e);
            }
        }
        
        log.info("Auto-completed {} expired exams", expiredExams.size());
    }

    /**
     * Send exam reminders for upcoming exams
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional(readOnly = true)
    public void sendExamReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindow = now.plusHours(24); // Remind 24 hours before
        
        List<Exam> upcomingExams = examRepository.findUpcomingExams(now, reminderWindow);
        
        if (upcomingExams.isEmpty()) {
            return;
        }
        
        for (Exam exam : upcomingExams) {
            try {
                long hoursUntilStart = ChronoUnit.HOURS.between(now, exam.getStartTime());
                
                // Only send reminder if exam starts in approximately 24 hours (23-25 hours window)
                if (hoursUntilStart >= 23 && hoursUntilStart <= 25) {
                    eventPublisher.publishExamReminder(exam);
                    log.info("Sent reminder for exam: {} (Title: {}, Starts in {} hours)", 
                            exam.getId(), exam.getTitle(), hoursUntilStart);
                }
            } catch (Exception e) {
                log.error("Failed to send reminder for exam: {}", exam.getId(), e);
            }
        }
        
        log.info("Sent reminders for {} upcoming exams", upcomingExams.size());
    }

    /**
     * Auto-start scheduled exams
     * Runs every minute
     */
    @Scheduled(fixedRate = 60000) // 1 minute
    @Transactional
    public void autoStartScheduledExams() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find published exams that should start now
        List<Exam> examsToStart = examRepository.findExamsToStart(now);
        
        if (examsToStart.isEmpty()) {
            return;
        }
        
        for (Exam exam : examsToStart) {
            try {
                // The exam status remains PUBLISHED, but we publish a "started" event
                // to notify other services that the exam window is now open
                eventPublisher.publishExamStarted(exam, null); // null for scheduled start
                
                log.info("Auto-started scheduled exam: {} (Title: {})", exam.getId(), exam.getTitle());
            } catch (Exception e) {
                log.error("Failed to auto-start exam: {}", exam.getId(), e);
            }
        }
        
        log.info("Auto-started {} scheduled exams", examsToStart.size());
    }

    /**
     * Archive old completed exams
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void archiveOldCompletedExams() {
        LocalDateTime archiveThreshold = LocalDateTime.now().minusDays(90); // Archive after 90 days
        
        List<Exam> oldCompletedExams = examRepository.findOldCompletedExams(archiveThreshold);
        
        if (oldCompletedExams.isEmpty()) {
            log.info("No old completed exams to archive");
            return;
        }
        
        for (Exam exam : oldCompletedExams) {
            try {
                exam.setStatus(ExamStatus.ARCHIVED);
                exam.setIsActive(false);
                examRepository.save(exam);
                
                eventPublisher.publishExamArchived(exam);
                
                log.info("Archived old completed exam: {} (Title: {}, Completed: {})", 
                        exam.getId(), exam.getTitle(), exam.getEndTime());
            } catch (Exception e) {
                log.error("Failed to archive exam: {}", exam.getId(), e);
            }
        }
        
        log.info("Archived {} old completed exams", oldCompletedExams.size());
    }

    /**
     * Clean up cancelled exams older than 30 days
     * Runs daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldCancelledExams() {
        LocalDateTime cleanupThreshold = LocalDateTime.now().minusDays(30);
        
        List<Exam> oldCancelledExams = examRepository.findOldCancelledExams(cleanupThreshold);
        
        if (oldCancelledExams.isEmpty()) {
            log.info("No old cancelled exams to cleanup");
            return;
        }
        
        for (Exam exam : oldCancelledExams) {
            try {
                if (exam.getStatus() == ExamStatus.CANCELLED) {
                    exam.setStatus(ExamStatus.ARCHIVED);
                    exam.setIsActive(false);
                    examRepository.save(exam);
                    
                    log.info("Archived old cancelled exam: {} (Title: {})", exam.getId(), exam.getTitle());
                }
            } catch (Exception e) {
                log.error("Failed to cleanup cancelled exam: {}", exam.getId(), e);
            }
        }
        
        log.info("Cleaned up {} old cancelled exams", oldCancelledExams.size());
    }
}