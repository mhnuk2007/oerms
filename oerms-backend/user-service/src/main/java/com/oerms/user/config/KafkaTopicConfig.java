package com.oerms.user.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${app.kafka.topics.user-registered}")
    private String userRegisteredTopic;

    @Value("${app.kafka.topics.user-profile-created}")
    private String userProfileCreatedTopic;

    @Value("${app.kafka.topics.user-profile-updated}")
    private String userProfileUpdatedTopic;

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

    @Bean
    public NewTopic userProfileUpdatedTopic() {
        return TopicBuilder.name(userProfileUpdatedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
