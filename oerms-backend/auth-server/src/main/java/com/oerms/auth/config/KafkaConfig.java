package com.oerms.auth.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${app.kafka.topics.user-registered}")
    private String userRegisteredTopic;

    @Value("${app.kafka.topics.user-profile-created}")
    private String userProfileCreatedTopic;

    @Bean
    public NewTopic userRegisteredTopic() {
        return TopicBuilder.name(userRegisteredTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userProfileCreatedTopic() {
        return TopicBuilder.name(userProfileCreatedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}