# `auth-server` Module Plan (Part 2)

This document outlines the planned structure and contents of the `auth-server` module.

## Services

### `AuthService.java`

```java
package com.oerms.auth.service;

import com.oerms.auth.entity.Role;
import com.oerms.auth.entity.User;
import com.oerms.auth.repository.RoleRepository;
import com.oerms.auth.repository.UserRepository;
import com.oerms.common.dto.UserCreatedEvent;
import com.oerms.common.dto.UserRegistrationDTO;
import com.oerms.common.exception.ResourceAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaTemplate<String, UserCreatedEvent> kafkaTemplate;
    private final TokenService tokenService;

    @Transactional
    public UUID registerUser(UserRegistrationDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }

        Role userRole = roleRepository.findByName("USER")
            .orElseGet(() -> {
                Role role = Role.builder()
                    .name("USER")
                    .description("Default user role")
                    .build();
                return roleRepository.save(role);
            });

        User user = User.builder()
            .username(dto.getUsername())
            .password(passwordEncoder.encode(dto.getPassword()))
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .roles(Set.of(userRole))
            .build();

        user = userRepository.save(user);

        UserCreatedEvent event = UserCreatedEvent.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .build();

        kafkaTemplate.send("user-created-topic", event);
        log.info("User created event published for userId: {}", user.getId());

        return user.getId();
    }
}
```

### `TokenService.java`

```java
package com.oerms.auth.service;

import com.oerms.auth.security.CustomUserDetails;
import com.oerms.common.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final RegisteredClientRepository registeredClientRepository;
    private final OAuth2AuthorizationService authorizationService;

    public TokenResponse generateTokens(CustomUserDetails userDetails) {
        RegisteredClient client = registeredClientRepository.findByClientId("oerms-client");

        Instant issuedAt = Instant.now();
        Instant accessTokenExpiresAt = issuedAt.plus(1, ChronoUnit.HOURS);
        Instant refreshTokenExpiresAt = issuedAt.plus(30, ChronoUnit.DAYS);

        Set<String> authorities = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());

        JwtClaimsSet accessTokenClaims = JwtClaimsSet.builder()
            .issuer("http://localhost:9000")
            .subject(userDetails.getUsername())
            .audience(Set.of("oerms-client"))
            .issuedAt(issuedAt)
            .expiresAt(accessTokenExpiresAt)
            .claim("scope", "read write")
            .claim("authorities", authorities)
            .claim("userId", userDetails.getUserId().toString())
            .build();

        String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(accessTokenClaims)).getTokenValue();
        String refreshToken = UUID.randomUUID().toString();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities()
        );

        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
            .principalName(userDetails.getUsername())
            .authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.PASSWORD)
            .attribute(OAuth2Authorization.AUTHORIZED_SCOPE_ATTRIBUTE_NAME, Set.of("read", "write"))
            .token(new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                accessToken,
                issuedAt,
                accessTokenExpiresAt,
                Set.of("read", "write")
            ))
            .token(new OAuth2RefreshToken(
                refreshToken,
                issuedAt,
                refreshTokenExpiresAt
            ))
            .build();

        authorizationService.save(authorization);

        return TokenResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(3600L)
            .scope("read write")
            .build();
    }
}
```

## Controllers

### `AuthController.java`

```java
package com.oerms.auth.controller;

import com.oerms.auth.security.CustomUserDetails;
import com.oerms.auth.security.CustomUserDetailsService;
import com.oerms.auth.service.AuthService;
import com.oerms.auth.service.TokenService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.TokenResponse;
import com.oerms.common.dto.UserRegistrationDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody UserRegistrationDTO dto) {

        UUID userId = authService.registerUser(dto);

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(dto.getUsername());
        TokenResponse tokens = tokenService.generateTokens(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("tokens", tokens);
        response.put("redirectUrl", "/api/users/" + userId + "/profile");

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@RequestBody UserRegistrationDTO dto) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(dto.getUsername());

            if (!passwordEncoder.matches(dto.getPassword(), userDetails.getPassword())) {
                throw new BadCredentialsException("Invalid credentials");
            }

            TokenResponse tokens = tokenService.generateTokens(userDetails);
            return ResponseEntity.ok(ApiResponse.success("Login successful", tokens));

        } catch (UsernameNotFoundException e) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }
}
```

## Configuration

### `KafkaConfig.java`

```java
package com.oerms.auth.config;

import com.oerms.common.dto.UserCreatedEvent;
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
    public ProducerFactory<String, UserCreatedEvent> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, UserCreatedEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

### `JpaConfig.java`

```java
package com.oerms.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("system");
            }
            return Optional.of(authentication.getName());
        };
    }
}
```

### `application.yml`

```yaml
server:
  port: 9000

spring:
  application:
    name: auth-server

  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_auth
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

  data:
    redis:
      host: localhost
      port: 6379

  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    instance:
      prefer-ip-address: true

logging:
  level:
    com.oerms: DEBUG
    org.springframework.security: DEBUG
```

## Database Migrations

### `db/migration/V1__init_schema.sql`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    resource VARCHAR(100),
    action VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_permissions_name ON permissions(name);
```

### `db/migration/V2__insert_default_roles_permissions.sql`

```sql
INSERT INTO roles (id, name, description, created_at, updated_at, created_by, last_modified_by, version)
VALUES
(gen_random_uuid(), 'USER', 'Default user role', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'TEACHER', 'Teacher role', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'ADMIN', 'Administrator role', NOW(), NOW(), 'system', 'system', 0);

INSERT INTO permissions (id, name, description, resource, action, created_at, updated_at, created_by, last_modified_by, version)
VALUES
(gen_random_uuid(), 'exam:create', 'Create exams', 'exam', 'create', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'exam:read', 'Read exams', 'exam', 'read', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'exam:update', 'Update exams', 'exam', 'update', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'exam:delete', 'Delete exams', 'exam', 'delete', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'question:create', 'Create questions', 'question', 'create', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'question:read', 'Read questions', 'question', 'read', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'attempt:create', 'Create attempts', 'attempt', 'create', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'result:read', 'Read results', 'result', 'read', NOW(), NOW(), 'system', 'system', 0),
(gen_random_uuid(), 'user:manage', 'Manage users', 'user', 'manage', NOW(), NOW(), 'system', 'system', 0);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'USER' AND p.name IN ('exam:read', 'attempt:create', 'result:read');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'TEACHER' AND p.name IN ('exam:create', 'exam:read', 'exam:update', 'exam:delete', 'question:create', 'question:read', 'result:read');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN';
```
