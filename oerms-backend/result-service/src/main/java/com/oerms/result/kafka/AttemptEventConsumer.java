package com.oerms.result.kafka;

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

    @KafkaListener(topics = "attempt-submitted-topic", groupId = "result-service-group")
    public void handleAttemptSubmitted(AttemptEvent event) {
        log.info("Received attempt submitted event: {}", event.getAttemptId());
        
        try {
            // Fetch attempt details
            // Create result
            resultService.createResultFromAttempt(attemptDTO);
        } catch (Exception e) {
            log.error("Error processing attempt submitted event", e);
        }
    }
}