package com.oerms.exam.service;

import com.oerms.exam.entity.Exam;
import com.oerms.exam.enums.ExamEventType;
import com.oerms.exam.event.ExamEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamEventPublisher {

    private final KafkaTemplate<String, ExamEvent> kafkaTemplate;
    
    private static final String EXAM_EVENTS_TOPIC = "exam-events";

    /**
     * Publishes exam created event
     */
    public void publishExamCreated(Exam exam) {
        publishEvent(ExamEventType.EXAM_CREATED, exam, null);
    }

    /**
     * Publishes exam updated event
     */
    public void publishExamUpdated(Exam exam) {
        publishEvent(ExamEventType.EXAM_UPDATED, exam, null);
    }

    /**
     * Publishes exam deleted event
     */
    public void publishExamDeleted(Exam exam) {
        publishEvent(ExamEventType.EXAM_DELETED, exam, null);
    }

    /**
     * Publishes exam published event
     */
    public void publishExamPublished(Exam exam) {
        publishEvent(ExamEventType.EXAM_PUBLISHED, exam, null);
    }

    /**
     * Publishes exam unpublished event
     */
    public void publishExamUnpublished(Exam exam) {
        publishEvent(ExamEventType.EXAM_UNPUBLISHED, exam, null);
    }

    /**
     * Publishes exam archived event
     */
    public void publishExamArchived(Exam exam) {
        publishEvent(ExamEventType.EXAM_ARCHIVED, exam, null);
    }

    /**
     * Publishes exam started event
     */
    public void publishExamStarted(Exam exam, UUID studentId) {
        publishEvent(ExamEventType.EXAM_STARTED, exam, studentId);
    }

    /**
     * Publishes exam completed event
     */
    public void publishExamCompleted(Exam exam, UUID studentId) {
        publishEvent(ExamEventType.EXAM_COMPLETED, exam, studentId);
    }

    /**
     * Publishes exam cancelled event
     */
    public void publishExamCancelled(Exam exam, String reason) {
        ExamEvent event = buildEvent(ExamEventType.EXAM_CANCELLED, exam, null);
        event.setMetadata("cancellationReason", reason);
        sendEvent(event, exam.getId());
    }

    /**
     * Publishes exam scheduled event
     */
    public void publishExamScheduled(Exam exam) {
        publishEvent(ExamEventType.EXAM_SCHEDULED, exam, null);
    }

    /**
     * Publishes exam reminder event
     */
    public void publishExamReminder(Exam exam) {
        publishEvent(ExamEventType.EXAM_REMINDER, exam, null);
    }

    /**
     * Generic method to publish events
     */
    private void publishEvent(ExamEventType eventType, Exam exam, UUID studentId) {
        ExamEvent event = buildEvent(eventType, exam, studentId);
        sendEvent(event, exam.getId());
    }

    /**
     * Builds exam event from exam entity
     */
    private ExamEvent buildEvent(ExamEventType eventType, Exam exam, UUID studentId) {
        return ExamEvent.builder()
                .eventType(eventType.getValue())
                .examId(exam.getId())
                .teacherId(exam.getTeacherId())
                .studentId(studentId)
                .title(exam.getTitle())
                .description(exam.getDescription())
                .duration(exam.getDuration())
                .totalMarks(exam.getTotalMarks())
                .passingMarks(exam.getPassingMarks())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .status(exam.getStatus().name())
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Sends event to Kafka topic
     */
    private void sendEvent(ExamEvent event, UUID examId) {
        try {
            kafkaTemplate.send(EXAM_EVENTS_TOPIC, String.valueOf(examId), event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish event: {} for exam: {}", 
                                    event.getEventType(), examId, ex);
                        } else {
                            log.info("Successfully published event: {} for exam: {}", 
                                    event.getEventType(), examId);
                        }
                    });
        } catch (Exception e) {
            log.error("Error sending event: {} for exam: {}", event.getEventType(), examId, e);
        }
    }
}