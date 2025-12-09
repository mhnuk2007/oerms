# `user-service` Module Plan

This document outlines the planned structure and contents of the `user-service` module.

## `pom.xml`

Add these dependencies to the existing `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

## Main Application

### `UserServiceApplication.java`

```java
package com.oerms.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
@EnableCaching
@EntityScan(basePackages = {"com.oerms.user.entity", "com.oerms.common.entity"})
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

## Services

### `UserProfileService.java` (with Caching)

```java
package com.oerms.user.service;

import com.oerms.common.dto.UserProfileDTO;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.user.entity.UserProfile;
import com.oerms.user.mapper.UserProfileMapper;
import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;

    public void createProfile(UUID userId) {
        if (userProfileRepository.findByUserId(userId).isPresent()) {
            log.warn("Profile already exists for userId: {}", userId);
            return;
        }

        UserProfile profile = UserProfile.builder()
            .userId(userId)
            .profileCompleted(false)
            .build();

        userProfileRepository.save(profile);
        log.info("Profile created for userId: {}", userId);
    }

    @Cacheable(value = "userProfiles", key = "#userId", unless = "#result == null")
    @Transactional(readOnly = true)
    public UserProfileDTO getProfileByUserId(UUID userId) {
        log.debug("Fetching profile for userId: {} from database", userId);
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found for userId: " + userId));
        return userProfileMapper.toDto(profile);
    }

    @CacheEvict(value = "userProfiles", key = "#userId")
    @Transactional
    public UserProfileDTO updateProfile(UUID userId, UserProfileDTO dto) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found for userId: " + userId));

        userProfileMapper.updateEntity(dto, profile);

        if (profile.getFirstname() != null && profile.getLastname() != null
            && profile.getCity() != null && profile.getInstitution() != null) {
            profile.setProfileCompleted(true);
        }

        profile = userProfileRepository.save(profile);
        log.info("Profile updated and cache evicted for userId: {}", userId);

        return userProfileMapper.toDto(profile);
    }
}
```

## Configuration

### `KafkaConsumerConfig.java` (Improved)

```java
package com.oerms.user.config;

import com.oerms.common.dto.UserCreatedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, UserCreatedEvent> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "user-service-group");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        config.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        config.put(JsonDeserializer.TRUSTED_PACKAGES, "com.oerms.common.dto");
        config.put(JsonDeserializer.VALUE_DEFAULT_TYPE, UserCreatedEvent.class);
        config.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        return new DefaultKafkaConsumerFactory<>(config);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, UserCreatedEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, UserCreatedEvent> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3); // Match partition count
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
        return factory;
    }
}
```

### `RedisCacheConfig.java`

```java
package com.oerms.user.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.activateDefaultTyping(
            BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer =
            new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(serializer)
            )
            .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .withCacheConfiguration("userProfiles",
                config.entryTtl(Duration.ofHours(1)))
            .build();
    }
}
```

## Listeners

### `UserCreatedEventListener.java` (Improved)

```java
package com.oerms.user.listener;

import com.oerms.common.dto.UserCreatedEvent;
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
public class UserCreatedEventListener {

    private final UserProfileService userProfileService;

    @KafkaListener(
        topics = "user-events",
        groupId = "user-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleUserEvent(
            @Payload UserCreatedEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        try {
            log.info("Received user event - Key: {}, Partition: {}, Offset: {}, Event: {}",
                key, partition, offset, event);

            if ("user.created".equals(key)) {
                userProfileService.createProfile(event.getUserId());
                acknowledgment.acknowledge();
                log.info("Successfully processed user.created event for userId: {}", event.getUserId());
            } else {
                log.warn("Unknown event key: {}", key);
                acknowledgment.acknowledge(); // Acknowledge to avoid reprocessing
            }

        } catch (Exception e) {
            log.error("Error processing user event: {}", event, e);
            // Don't acknowledge - message will be reprocessed
            throw e;
        }
    }
}
```

## `application.yml` (with Redis Cache)

```yaml
server:
  port: 9001

spring:
  application:
    name: user-service

  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_user
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc:
          batch_size: 20
          order_inserts: true
          order_updates: true

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

  data:
    redis:
      host: localhost
      port: 6379
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2

  cache:
    type: redis
    redis:
      time-to-live: 1800000 # 30 minutes
      cache-null-values: false

  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: user-service-group
      auto-offset-reset: earliest
      enable-auto-commit: false
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JsonDeserializer
        spring.json.trusted.packages: com.oerms.common.dto
    listener:
      ack-mode: manual

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000
          jwk-set-uri: http://localhost:9000/oauth2/jwks

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    instance:
      prefer-ip-address: true

logging:
  level:
    com.oerms: DEBUG
    org.springframework.kafka: INFO
    org.springframework.cache: DEBUG
```
