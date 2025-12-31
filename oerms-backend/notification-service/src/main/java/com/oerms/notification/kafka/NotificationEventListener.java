package com.oerms.notification.kafka;

import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.event.*;
import com.oerms.notification.dto.SendNotificationRequest;
import com.oerms.notification.enums.NotificationType;
import com.oerms.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    private void handleEvent(String eventType, String entityId, Runnable notificationLogic, Acknowledgment ack) {
        log.info("Received {} for ID: {}", eventType, entityId);
        try {
            notificationLogic.run();
            ack.acknowledge();
            log.info("Successfully processed {} for ID: {}", eventType, entityId);
        } catch (Exception e) {
            log.error("Failed to process {} for ID: {}", eventType, entityId, e);
            // Not acknowledging the message, so it can be retried by Kafka
        }
    }

    @KafkaListener(topics = "${kafka.topics.user-registered}", groupId = "notification-service-group")
    public void handleUserRegistered(UserRegisteredEvent event, Acknowledgment ack) {
        handleEvent("UserRegisteredEvent", event.getUserId().toString(), () -> {
            SendNotificationRequest request = SendNotificationRequest.builder()
                    .userId(event.getUserId())
                    .email(event.getEmail())
                    .type(NotificationType.USER_REGISTERED)
                    .title("Welcome to OERMS!")
                    .message(String.format("Welcome %s! Your account has been successfully created.", event.getUsername()))
                    .sendEmail(true)
                    .sendInApp(true)
                    .priority(8)
                    .build();
            notificationService.sendNotification(request);
        }, ack);
    }

    @KafkaListener(topics = "${kafka.topics.exam-created}", groupId = "notification-service-group")
    public void handleExamCreated(ExamCreatedEvent event, Acknowledgment ack) {
        handleEvent("ExamCreatedEvent", event.getExamId().toString(), () -> {
            SendNotificationRequest request = SendNotificationRequest.builder()
                    .userId(event.getCreatedBy())
                    .type(NotificationType.EXAM_CREATED)
                    .title("Exam Created Successfully")
                    .message(String.format("Your exam '%s' has been created in draft mode.", event.getTitle()))
                    .relatedEntityId(event.getExamId())
                    .relatedEntityType("EXAM")
                    .sendInApp(true)
                    .priority(5)
                    .build();
            notificationService.sendNotification(request);
        }, ack);
    }

    @KafkaListener(topics = "${kafka.topics.exam-published}", groupId = "notification-service-group")
    public void handleExamPublished(ExamPublishedEvent event, Acknowledgment ack) {
        handleEvent("ExamPublishedEvent", event.getExamId().toString(), () -> {
            // Note: Exam title is not in the event. The message is generic.
            SendNotificationRequest teacherRequest = SendNotificationRequest.builder()
                    .userId(event.getPublishedBy())
                    .type(NotificationType.EXAM_PUBLISHED)
                    .title("Exam Published")
                    .message("An exam you created has been published and is now live for students.")
                    .relatedEntityId(event.getExamId())
                    .relatedEntityType("EXAM")
                    .actionUrl("/exams/" + event.getExamId())
                    .sendEmail(true)
                    .sendInApp(true)
                    .priority(7)
                    .build();
            notificationService.sendNotification(teacherRequest);
        }, ack);
    }

    @KafkaListener(topics = "${kafka.topics.attempt-submitted}", groupId = "notification-service-group")
    public void handleAttemptSubmitted(AttemptEvent event, Acknowledgment ack) {
        handleEvent("AttemptSubmittedEvent", event.getAttemptId().toString(), () -> {
            AttemptDTO attempt = event.getAttemptDTO();
            SendNotificationRequest request = SendNotificationRequest.builder()
                    .userId(attempt.getStudentId())
                    .type(NotificationType.ATTEMPT_SUBMITTED)
                    .title("Exam Submitted Successfully")
                    .message(String.format("Your submission for exam '%s' has been received.", attempt.getExamTitle()))
                    .relatedEntityId(event.getAttemptId())
                    .relatedEntityType("ATTEMPT")
                    .actionUrl("/attempts/" + event.getAttemptId())
                    .sendEmail(true)
                    .sendInApp(true)
                    .priority(8)
                    .build();
            notificationService.sendNotification(request);
        }, ack);
    }

    @KafkaListener(topics = "${kafka.topics.result-published}", groupId = "notification-service-group")
    public void handleResultPublished(ResultPublishedEvent event, Acknowledgment ack) {
        handleEvent("ResultPublishedEvent", event.getResultId().toString(), () -> {
            String statusMessage = Boolean.TRUE.equals(event.getPassed())
                    ? "Congratulations! You passed."
                    : "Keep practicing to improve!";

            SendNotificationRequest request = SendNotificationRequest.builder()
                    .userId(null) // studentId is Long, cannot be cast to UUID
                    .type(NotificationType.RESULT_PUBLISHED)
                    .title("Exam Results Published")
                    .message(String.format("Results for your exam are now available. " +
                                    "Score: %.2f/%.0f (%.1f%%). %s",
                            event.getObtainedMarks(),
                            event.getTotalMarks(),
                            event.getPercentage(),
                            statusMessage))
                    .relatedEntityId(null) // resultId is Long
                    .relatedEntityType("RESULT")
                    .actionUrl("/results/" + event.getResultId())
                    .sendEmail(true) // Email will fail without a recipient
                    .sendInApp(true)
                    .priority(9)
                    .build();
            // notificationService.sendNotification(request); // Commented out due to type mismatch
            log.warn("Skipping notification for ResultPublishedEvent due to studentId type mismatch (Long vs UUID). Event: {}", event);
        }, ack);
    }
}