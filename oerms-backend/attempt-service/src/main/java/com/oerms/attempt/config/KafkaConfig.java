package com.oerms.attempt.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.oerms.attempt.kafka.AttemptEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, AttemptEvent> attemptEventProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        JsonSerializer<AttemptEvent> jsonSerializer = new JsonSerializer<>(objectMapper);
        jsonSerializer.setAddTypeInfo(false);

        return new DefaultKafkaProducerFactory<>(configProps, new StringSerializer(), jsonSerializer);
    }

    @Bean
    public KafkaTemplate<String, AttemptEvent> attemptEventKafkaTemplate() {
        return new KafkaTemplate<>(attemptEventProducerFactory());
    }

    @Bean
    public NewTopic attemptStartedTopic() {
        return new NewTopic("attempt-started-topic", 3, (short) 1);
    }

    @Bean
    public NewTopic attemptSubmittedTopic() {
        return new NewTopic("attempt-submitted-topic", 3, (short) 1);
    }

    @Bean
    public NewTopic attemptAutoSubmittedTopic() {
        return new NewTopic("attempt-auto-submitted-topic", 3, (short) 1);
    }

    @Bean
    public NewTopic answerSavedTopic() {
        return new NewTopic("answer-saved-topic", 3, (short) 1);
    }
}
