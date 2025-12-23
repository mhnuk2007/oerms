package com.oerms.attempt.kafka;

import com.oerms.attempt.entity.ExamAttempt;
import com.oerms.attempt.mapper.AttemptMapper;
import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.event.AttemptEvent;
import com.oerms.common.enums.AttemptEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttemptEventProducer {

    private final KafkaTemplate<String, AttemptEvent> kafkaTemplate;
    private final AttemptMapper attemptMapper; // inject mapper

    private static final String ATTEMPT_STARTED = "attempt-started-topic";
    private static final String ATTEMPT_SUBMITTED = "attempt-submitted-topic";
    private static final String ATTEMPT_AUTO_SUBMITTED = "attempt-auto-submitted-topic";

    public void publishAttemptStarted(ExamAttempt attempt) {
        send(attempt, AttemptEventType.ATTEMPT_STARTED, ATTEMPT_STARTED);
    }

    public void publishAttemptSubmitted(ExamAttempt attempt) {
        send(attempt, AttemptEventType.ATTEMPT_SUBMITTED, ATTEMPT_SUBMITTED);
    }

    public void publishAttemptAutoSubmitted(ExamAttempt attempt) {
        send(attempt, AttemptEventType.ATTEMPT_AUTO_SUBMITTED, ATTEMPT_AUTO_SUBMITTED);
    }

    private void send(ExamAttempt attempt, AttemptEventType type, String topic) {
        AttemptDTO attemptDto = attemptMapper.toCommonDto(attempt); // correct Kafka DTO

        AttemptEvent event = AttemptEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType(type)
                .eventTime(LocalDateTime.now())
                .sourceService("attempt-service")
                .attemptId(attempt.getId())
                .attemptDTO(attemptDto)
                .build();

        kafkaTemplate.send(topic, attempt.getId().toString(), event);
        log.info("Published {} event for attemptId={}", type, attempt.getId());
    }
}
