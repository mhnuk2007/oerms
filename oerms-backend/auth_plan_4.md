# `auth-server` Module Plan (Part 4)

This document outlines the planned structure and contents of the `auth-server` module.

## Security

### `CustomUserDetails.java` (Updated)

```java
package com.oerms.auth.security;

import com.oerms.auth.entity.User;
import com.oerms.common.enums.Role;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    @Getter
    private final UUID userId;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails from(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // Add roles with ROLE_ prefix
        user.getRoles().forEach(role ->
            authorities.add(new SimpleGrantedAuthority(role.getRoleWithPrefix()))
        );

        // Add granular permissions based on roles
        user.getRoles().forEach(role -> {
            switch (role) {
                case STUDENT -> {
                    authorities.add(new SimpleGrantedAuthority("exam:read"));
                    authorities.add(new SimpleGrantedAuthority("attempt:create"));
                    authorities.add(new SimpleGrantedAuthority("result:read"));
                }
                case TEACHER -> {
                    authorities.add(new SimpleGrantedAuthority("exam:create"));
                    authorities.add(new SimpleGrantedAuthority("exam:read"));
                    authorities.add(new SimpleGrantedAuthority("exam:update"));
                    authorities.add(new SimpleGrantedAuthority("exam:delete"));
                    authorities.add(new SimpleGrantedAuthority("question:create"));
                    authorities.add(new SimpleGrantedAuthority("question:read"));
                    authorities.add(new SimpleGrantedAuthority("question:update"));
                    authorities.add(new SimpleGrantedAuthority("question:delete"));
                    authorities.add(new SimpleGrantedAuthority("result:read"));
                }
                case ADMIN -> {
                    authorities.add(new SimpleGrantedAuthority("exam:create"));
                    authorities.add(new SimpleGrantedAuthority("exam:read"));
                    authorities.add(new SimpleGrantedAuthority("exam:update"));
                    authorities.add(new SimpleGrantedAuthority("exam:delete"));
                    authorities.add(new SimpleGrantedAuthority("question:create"));
                    authorities.add(new SimpleGrantedAuthority("question:read"));
                    authorities.add(new SimpleGrantedAuthority("question:update"));
                    authorities.add(new SimpleGrantedAuthority("question:delete"));
                    authorities.add(new SimpleGrantedAuthority("attempt:create"));
                    authorities.add(new SimpleGrantedAuthority("result:read"));
                    authorities.add(new SimpleGrantedAuthority("user:manage"));
                }
            }
        });

        return new CustomUserDetails(
            user.getId(),
            user.getUserName(),
            user.getPassword(),
            user.isEnabled(),
            user.isAccountNonExpired(),
            user.isAccountNonLocked(),
            user.isCredentialsNonExpired(),
            authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
```

### `CustomUserDetailsService.java` (Updated)

```java
package com.oerms.auth.security;

import com.oerms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUserName(username)
            .map(CustomUserDetails::from)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
```

## Repositories

### `UserRepository.java` (Updated)

```java
package com.oerms.auth.repository;

import com.oerms.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUserName(String userName);
    Optional<User> findByEmail(String email);
    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);
}
```

## DTOs

### `UserRegistrationDTO.java` (Updated)

```java
package com.oerms.common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String userName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;
}
```

### `UserCreatedEvent.java` (Updated)

```java
package com.oerms.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedEvent {
    private UUID userId;
    private String username;
    private String email;
}
```

## Services

### `AuthService.java` (Updated)

```java
package com.oerms.auth.service;

import com.oerms.auth.entity.User;
import com.oerms.auth.repository.UserRepository;
import com.oerms.common.dto.UserCreatedEvent;
import com.oerms.common.dto.UserRegistrationDTO;
import com.oerms.common.enums.Role;
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
    private final PasswordEncoder passwordEncoder;
    private final KafkaTemplate<String, UserCreatedEvent> kafkaTemplate;

    @Transactional
    public UUID registerUser(UserRegistrationDTO dto) {
        if (userRepository.existsByUserName(dto.getUserName())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
            .userName(dto.getUserName())
            .email(dto.getEmail())
            .password(passwordEncoder.encode(dto.getPassword()))
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .roles(Set.of(Role.STUDENT)) // Default role
            .build();

        user = userRepository.save(user);

        // Publish event for profile creation
        UserCreatedEvent event = UserCreatedEvent.builder()
            .userId(user.getId())
            .username(user.getUserName())
            .email(user.getEmail())
            .build();

        kafkaTemplate.send("user-events", "user.created", event);
        log.info("User created event published for userId: {}", user.getId());

        return user.getId();
    }

    @Transactional
    public void assignRole(UUID userId, Role role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceAlreadyExistsException("User not found"));

        user.getRoles().add(role);
        userRepository.save(user);
        log.info("Role {} assigned to userId: {}", role, userId);
    }

    @Transactional
    public void removeRole(UUID userId, Role role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceAlreadyExistsException("User not found"));

        user.getRoles().remove(role);
        userRepository.save(user);
        log.info("Role {} removed from userId: {}", role, userId);
    }
}
```

## Controllers

### `RoleController.java` (New)

```java
package com.oerms.auth.controller;

import com.oerms.auth.service.AuthService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth/roles")
@RequiredArgsConstructor
public class RoleController {

    private final AuthService authService;

    @PostMapping("/{userId}/assign/{role}")
    @PreAuthorize("hasAuthority('user:manage')")
    public ResponseEntity<ApiResponse<Void>> assignRole(
            @PathVariable UUID userId,
            @PathVariable Role role) {
        authService.assignRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", null));
    }

    @DeleteMapping("/{userId}/remove/{role}")
    @PreAuthorize("hasAuthority('user:manage')")
    public ResponseEntity<ApiResponse<Void>> removeRole(
            @PathVariable UUID userId,
            @PathVariable Role role) {
        authService.removeRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", null));
    }
}
```

### `ExamController.java` (Updated Authorization)

```java
package com.oerms.exam.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.ExamDTO;
import com.oerms.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('exam:create', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> createExam(
            @RequestBody ExamDTO dto,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        ExamDTO created = examService.createExam(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Exam created successfully", created));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('exam:read', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> getExam(@PathVariable UUID id) {
        ExamDTO exam = examService.getExamById(id);
        return ResponseEntity.ok(ApiResponse.success(exam));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('exam:read', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getAllPublishedExams() {
        List<ExamDTO> exams = examService.getAllPublishedExams();
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/my-exams")
    @PreAuthorize("hasAnyAuthority('exam:create', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getMyExams(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<ExamDTO> exams = examService.getExamsByTeacher(userId);
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('exam:update', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> updateExam(
            @PathVariable UUID id,
            @RequestBody ExamDTO dto,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        ExamDTO updated = examService.updateExam(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('exam:delete', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteExam(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        examService.deleteExam(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyAuthority('exam:update', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> publishExam(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        ExamDTO published = examService.publishExam(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", published));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return UUID.fromString(jwt.getClaimAsString("userId"));
    }
}
```

### `QuestionController.java` (Updated Authorization)

```java
package com.oerms.question.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import com.oerms.question.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('question:create', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<QuestionDTO>> createQuestion(@RequestBody QuestionDTO dto) {
        QuestionDTO created = questionService.createQuestion(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Question created successfully", created));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('question:read', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<QuestionDTO>> getQuestion(@PathVariable UUID id) {
        QuestionDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyAuthority('question:read', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getQuestionsByExam(@PathVariable UUID examId) {
        List<QuestionDTO> questions = questionService.getQuestionsByExamId(examId);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('question:update', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<QuestionDTO>> updateQuestion(
            @PathVariable UUID id,
            @RequestBody QuestionDTO dto) {
        QuestionDTO updated = questionService.updateQuestion(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('question:delete', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }
}
```

### `AttemptController.java` (Updated Authorization)

```java
package com.oerms.attempt.controller;

import com.oerms.attempt.service.AttemptService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/start/{examId}")
    @PreAuthorize("hasAnyAuthority('attempt:create', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AttemptDTO>> startAttempt(
            @PathVariable UUID examId,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        AttemptDTO attempt = attemptService.startAttempt(examId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Attempt started", attempt));
    }

    @PostMapping("/{attemptId}/submit")
    @PreAuthorize("hasAnyAuthority('attempt:create', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AttemptDTO>> submitAttempt(
            @PathVariable UUID attemptId,
            @RequestBody Map<UUID, String> answers,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        AttemptDTO attempt = attemptService.submitAttempt(attemptId, answers, userId);
        return ResponseEntity.ok(ApiResponse.success("Attempt submitted", attempt));
    }

    @GetMapping("/my-attempts")
    @PreAuthorize("hasAnyAuthority('result:read', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AttemptDTO>>> getMyAttempts(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<AttemptDTO> attempts = attemptService.getUserAttempts(userId);
        return ResponseEntity.ok(ApiResponse.success(attempts));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('result:read', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AttemptDTO>> getAttempt(@PathVariable UUID id) {
        AttemptDTO attempt = attemptService.getAttemptById(id);
        return ResponseEntity.ok(ApiResponse.success(attempt));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return UUID.fromString(jwt.getClaimAsString("userId"));
    }
}
```

### `ResultController.java` (Updated Authorization)

```java
package com.oerms.result.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.ResultDTO;
import com.oerms.result.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @GetMapping("/attempt/{attemptId}")
    @PreAuthorize("hasAnyAuthority('result:read', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ResultDTO>> getResultByAttempt(@PathVariable UUID attemptId) {
        ResultDTO result = resultService.getResultByAttemptId(attemptId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/my-results")
    @PreAuthorize("hasAnyAuthority('result:read', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ResultDTO>>> getMyResults(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        UUID userId = UUID.fromString(jwt.getClaimAsString("userId"));
        List<ResultDTO> results = resultService.getUserResults(userId);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
```

## Database Migrations

### `V1__init_schema.sql` (Updated)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
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

CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_users_email ON users(email);
```

### `V2__insert_admin_user.sql` (New)

```sql
-- Insert admin user (password: admin123)
INSERT INTO users (id, user_name, email, password, enabled, account_non_expired, account_non_locked, credentials_non_expired, created_at, updated_at, created_by, last_modified_by, version)
VALUES
(gen_random_uuid(), 'admin', 'admin@oerms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE, TRUE, TRUE, TRUE, NOW(), NOW(), 'system', 'system', 0);

-- Assign ADMIN role
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE user_name = 'admin';

-- Insert demo teacher (password: teacher123)
INSERT INTO users (id, user_name, email, password, enabled, account_non_expired, account_non_locked, credentials_non_expired, created_at, updated_at, created_by, last_modified_by, version)
VALUES
(gen_random_uuid(), 'teacher', 'teacher@oerms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE, TRUE, TRUE, TRUE, NOW(), NOW(), 'system', 'system', 0);

-- Assign TEACHER role
INSERT INTO user_roles (user_id, role)
SELECT id, 'TEACHER' FROM users WHERE user_name = 'teacher';
```

## API Gateway Security

In the `api-gateway`'s `SecurityConfig`, update the rules:

```java
.pathMatchers(HttpMethod.GET, "/api/exams/**").hasAnyAuthority("SCOPE_read", "exam:read", "ROLE_STUDENT", "ROLE_TEACHER", "ROLE_ADMIN")
.pathMatchers(HttpMethod.POST, "/api/exams/**").hasAnyAuthority("SCOPE_write", "exam:create", "ROLE_TEACHER", "ROLE_ADMIN")
.pathMatchers(HttpMethod.PUT, "/api/exams/**").hasAnyAuthority("SCOPE_write", "exam:update", "ROLE_TEACHER", "ROLE_ADMIN")
.pathMatchers(HttpMethod.DELETE, "/api/exams/**").hasAnyAuthority("SCOPE_write", "exam:delete", "ROLE_TEACHER", "ROLE_ADMIN")
```
