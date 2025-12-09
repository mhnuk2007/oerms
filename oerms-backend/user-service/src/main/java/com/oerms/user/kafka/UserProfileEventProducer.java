package com.oerms.user.kafka;

import com.oerms.common.event.UserProfileCreatedEvent;
import com.oerms.common.event.UserProfileUpdatedEvent;
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
public class UserProfileEventProducer {


private final KafkaTemplate<String, Object> kafkaTemplate;


@Value("${app.kafka.topics.user-profile-created}")
private String profileCreatedTopic;


@Value("${app.kafka.topics.user-profile-updated}")
private String profileUpdatedTopic;


public void publishProfileCreatedEvent(UserProfileCreatedEvent event) {
log.info("Publishing profile created event for userId={}", event.getUserId());


CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
profileCreatedTopic,
event.getUserId().toString(),
event
);


future.whenComplete((result, ex) -> {
if (ex == null) {
log.info("Published profile created event: userId={} offset={}", event.getUserId(), result.getRecordMetadata().offset());
} else {
log.error("Failed to publish profile created event for userId={}", event.getUserId(), ex);
}
});
}


public void publishProfileUpdatedEvent(UserProfileUpdatedEvent event) {
log.info("Publishing profile updated event for userId={}", event.getUserId());


CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
profileUpdatedTopic,
event.getUserId().toString(),
event
);


future.whenComplete((result, ex) -> {
if (ex == null) {
log.info("Published profile updated event: userId={} offset={}", event.getUserId(), result.getRecordMetadata().offset());
} else {
log.error("Failed to publish profile updated event for userId={}", event.getUserId(), ex);
}
});
}
}