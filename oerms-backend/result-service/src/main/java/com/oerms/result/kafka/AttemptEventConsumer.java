package com.oerms.result.kafka;

import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.event.AttemptEvent;
import com.oerms.result.service.ResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttemptEventConsumer {

    private final ResultService resultService;

    @KafkaListener(
            topics = {"attempt-submitted-topic", "attempt-auto-submitted-topic"},
            groupId = "result-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleAttemptSubmitted(AttemptEvent event) {
        log.info("Received attempt event of type {} for attemptId: {}", event.getEventType(), event.getAttemptId());

        try {
            AttemptDTO attemptDto = event.getAttemptDTO(); // use common DTO
            if (attemptDto == null) {
                log.error("AttemptDTO is null in received AttemptEvent for attemptId: {}", event.getAttemptId());
                return;
            }

            resultService.createResultFromAttempt(attemptDto);
            log.info("Successfully processed attempt event of type {} for attemptId: {}", event.getEventType(), event.getAttemptId());
        } catch (Exception e) {
            log.error("Error processing attempt event of type {} for attemptId: {}", event.getEventType(), event.getAttemptId(), e);
        }
    }
}
