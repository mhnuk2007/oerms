package com.oerms.auth.kafka;

import com.oerms.common.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.user-registered}")
    private String userRegisteredTopic;

    public void publishUserRegisteredEvent(UserRegisteredEvent event) {
        log.info("Publishing user registered event for userId: {}", event.getUserId());
        
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
            userRegisteredTopic, 
            event.getUserId().toString(), 
            event
        );

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("User registered event published successfully: userId={}, offset={}", 
                    event.getUserId(), 
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to publish user registered event for userId: {}", 
                    event.getUserId(), ex);
            }
        });
    }
}