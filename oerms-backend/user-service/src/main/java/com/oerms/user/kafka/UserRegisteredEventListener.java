package com.oerms.user.kafka;

import com.oerms.common.event.UserRegisteredEvent;
import com.oerms.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegisteredEventListener {

    private final UserProfileService profileService;

    @KafkaListener(
            topics = "${app.kafka.topics.user-registered}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(
            @Payload UserRegisteredEvent event,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment ack) {

        log.info("Consumed UserRegisteredEvent userId={} offset={}", event.getUserId(), offset);

        try {
            profileService.createProfileFromEvent(event);
            ack.acknowledge(); // manual ack
        } catch (Exception ex) {
            log.error("Error processing UserRegisteredEvent for userId={} : {}", event.getUserId(), ex.getMessage(), ex);
            throw ex; // can trigger retry or DLQ handling
        }
    }
}
