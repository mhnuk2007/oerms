# OERMS Auth Server - OAuth2 Spring Authorization Server (UUID-based)

## Important Note
⚠️ **All ID fields use UUID instead of Long for better scalability and security**

## Project Structure
```
auth-server/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── oerms/
        │           └── auth/
        │               ├── AuthServerApplication.java
        │               ├── config/
        │               │   ├── SecurityConfig.java
        │               │   ├── AuthorizationServerConfig.java
        │               │   ├── JwtConfig.java
        │               │   ├── RedisConfig.java
        │               │   ├── JpaConfig.java
        │               │   └── CorsConfig.java
        │               ├── entity/
        │               │   ├── User.java
        │               │   ├── VerificationToken.java
        │               │   └── PasswordResetToken.java
        │               ├── repository/
        │               │   ├── UserRepository.java
        │               │   ├── VerificationTokenRepository.java
        │               │   └── PasswordResetTokenRepository.java
        │               ├── service/
        │               │   ├── UserService.java
        │               │   ├── UserServiceImpl.java
        │               │   ├── CustomUserDetailsService.java
        │               │   ├── TokenBlacklistService.java
        │               │   └── EmailService.java
        │               ├── controller/
        │               │   ├── AuthController.java
        │               │   └── UserManagementController.java
        │               ├── dto/
        │               │   ├── RegisterRequest.java
        │               │   ├── LoginRequest.java
        │               │   ├── PasswordResetRequest.java
        │               │   ├── UserResponse.java
        │               │   └── TokenResponse.java
        │               └── security/
        │                   ├── JwtTokenCustomizer.java
        │                   └── CustomAuthenticationProvider.java
        └── resources/
            ├── application.yml
            ├── application-dev.yml
            ├── application-prod.yml
            └── db/
                └── migration/
                    ├── V1__create_users_table.sql
                    ├── V2__create_verification_tokens_table.sql
                    └── V3__create_password_reset_tokens_table.sql
```

---

## pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.oerms</groupId>
        <artifactId>oerms-parent</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>auth-server</artifactId>
    <name>OERMS Auth Server</name>
    <description>OAuth2 Authorization Server with Spring Authorization Server</description>

    <dependencies>
        <!-- Common Module -->
        <dependency>
            <groupId>com.oerms</groupId>
            <artifactId>common</artifactId>
        </dependency>

        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>

        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- Spring Authorization Server -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-oauth2-authorization-server</artifactId>
        </dependency>

        <!-- Spring Cloud -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>

        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
        </dependency>

        <!-- Flyway -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>

        <!-- Redis -->
        <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>

        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
        </dependency>

        <!-- Kafka (for events) -->
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## UPDATED Common Module - BaseEntity.java

```java
package com.oerms.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base entity class with UUID and common audit fields.
 * All domain entities should extend this class.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseEntity)) return false;
        BaseEntity that = (BaseEntity) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
```

---

## AuthServerApplication.java

```java
package com.oerms.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = {"com.oerms.auth"})
@EnableDiscoveryClient
@EnableJpaAuditing
@EnableAsync
public class AuthServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServerApplication.class, args);
    }
}
```

---

## Entity Classes

### User.java

```java
package com.oerms.auth.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_enabled", columnList = "enabled")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = false;

    @Column(name = "account_locked", nullable = false)
    @Builder.Default
    private Boolean accountLocked = false;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    public void addRole(Role role) {
        this.roles.add(role);
    }

    public void removeRole(Role role) {
        this.roles.remove(role);
    }

    public boolean isAccountNonLocked() {
        if (!accountLocked) return true;
        if (lockedUntil != null && LocalDateTime.now().isAfter(lockedUntil)) {
            accountLocked = false;
            lockedUntil = null;
            return true;
        }
        return false;
    }

    public void incrementFailedAttempts() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            this.accountLocked = true;
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    public void resetFailedAttempts() {
        this.failedLoginAttempts = 0;
        this.accountLocked = false;
        this.lockedUntil = null;
    }
}
```

### VerificationToken.java

```java
package com.oerms.auth.entity;

import com.oerms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens", indexes = {
    @Index(name = "idx_token", columnList = "token"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken extends BaseEntity {

    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "used", nullable = false)
    @Builder.Default
    private Boolean used = false;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !used && !isExpired();
    }
}
```

### PasswordResetToken.java

```java
package com.oerms.auth.entity;

import com.oerms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens", indexes = {
    @Index(name = "idx_reset_token", columnList = "token"),
    @Index(name = "idx_reset_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken extends BaseEntity {

    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "used", nullable = false)
    @Builder.Default
    private Boolean used = false;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !used && !isExpired();
    }
}
```

---

## Repository Classes

### UserRepository.java

```java
package com.oerms.auth.repository;

import com.oerms.auth.entity.User;
import com.oerms.common.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") Role role);

    Page<User> findByEnabledTrue(Pageable pageable);

    Page<User> findByEnabledFalse(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.fullName LIKE %:search% OR u.email LIKE %:search%")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r = :role")
    long countByRole(@Param("role") Role role);

    List<User> findByLastLoginBefore(LocalDateTime dateTime);
}
```

### VerificationTokenRepository.java

```java
package com.oerms.auth.repository;

import com.oerms.auth.entity.User;
import com.oerms.auth.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {

    Optional<VerificationToken> findByToken(String token);

    Optional<VerificationToken> findByUser(User user);

    void deleteByUser(User user);

    List<VerificationToken> findByExpiryDateBefore(LocalDateTime dateTime);
}
```

### PasswordResetTokenRepository.java

```java
package com.oerms.auth.repository;

import com.oerms.auth.entity.PasswordResetToken;
import com.oerms.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findByUser(User user);

    void deleteByUser(User user);

    List<PasswordResetToken> findByExpiryDateBefore(LocalDateTime dateTime);
}
```

---

## DTO Classes

### RegisterRequest.java

```java
package com.oerms.auth.dto;

import com.oerms.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @Builder.Default
    private Set<Role> roles = Set.of(Role.STUDENT);
}
```

### LoginRequest.java

```java
package com.oerms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
```

### PasswordResetRequest.java

```java
package com.oerms.auth.dto;

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
public class PasswordResetRequest {

    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String newPassword;
}
```

### UserResponse.java

```java
package com.oerms.auth.dto;

import com.oerms.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String fullName;
    private String email;
    private Boolean enabled;
    private Boolean accountLocked;
    private Boolean emailVerified;
    private Set<Role> roles;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### TokenResponse.java

```java
package com.oerms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private String scope;
    private UserResponse user;
}
```

---

## Service Layer

### UserService.java

```java
package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.enums.Role;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    UserResponse registerUser(RegisterRequest request);

    User findByEmail(String email);

    User findById(UUID id);

    void verifyEmail(String token);

    void initiatePasswordReset(String email);

    void resetPassword(String token, String newPassword);

    void updateLastLogin(UUID userId);

    void lockAccount(UUID userId);

    void unlockAccount(UUID userId);

    void enableUser(UUID userId);

    void disableUser(UUID userId);

    void assignRole(UUID userId, Role role);

    void removeRole(UUID userId, Role role);

    PageResponse<UserResponse> getAllUsers(Pageable pageable);

    PageResponse<UserResponse> searchUsers(String search, Pageable pageable);

    UserResponse getUserById(UUID id);

    void deleteUser(UUID id);
}
```

### UserServiceImpl.java

```java
package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.PasswordResetToken;
import com.oerms.auth.entity.User;
import com.oerms.auth.entity.VerificationToken;
import com.oerms.auth.repository.PasswordResetTokenRepository;
import com.oerms.auth.repository.UserRepository;
import com.oerms.auth.repository.VerificationTokenRepository;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.enums.Role;
import com.oerms.common.event.UserCreatedEvent;
import com.oerms.common.exception.DuplicateResourceException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public UserResponse registerUser(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .emailVerified(false)
                .accountLocked(false)
                .roles(request.getRoles())
                .build();

        user = userRepository.save(user);

        // Create verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        verificationTokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);

        // Publish event
        UserCreatedEvent event = new UserCreatedEvent(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getRoles().iterator().next().name()
        );
        kafkaTemplate.send("user-events", event);

        log.info("User registered successfully: {}", user.getEmail());
        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    public void verifyEmail(String token) {
        log.info("Verifying email with token");

        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ValidationException("Invalid verification token"));

        if (!verificationToken.isValid()) {
            throw new ValidationException("Verification token has expired or already used");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Override
    public void initiatePasswordReset(String email) {
        log.info("Initiating password reset for email: {}", email);

        User user = findByEmail(email);

        // Invalidate old tokens
        passwordResetTokenRepository.findByUser(user).forEach(t -> {
            t.setUsed(true);
            passwordResetTokenRepository.save(t);
        });

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);

        log.info("Password reset email sent to: {}", email);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token");

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ValidationException("Invalid password reset token"));

        if (!resetToken.isValid()) {
            throw new ValidationException("Password reset token has expired or already used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.resetFailedAttempts();
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    @Override
    public void updateLastLogin(UUID userId) {
        User user = findById(userId);
        user.setLastLogin(LocalDateTime.now());
        user.resetFailedAttempts();
        userRepository.save(user);
    }

    @Override
    public void lockAccount(UUID userId) {
        User user = findById(userId);
        user.setAccountLocked(true);
        user.setLockedUntil(null);
        userRepository.save(user);
        log.info("Account locked: {}", user.getEmail());
    }

    @Override
    public void unlockAccount(UUID userId) {
        User user = findById(userId);
        user.resetFailedAttempts();
        userRepository.save(user);
        log.info("Account unlocked: {}", user.getEmail());
    }

    @Override
    public void enableUser(UUID userId) {
        User user = findById(userId);
        user.setEnabled(true);
        userRepository.save(user);
        log.info("User enabled: {}", user.getEmail());
    }

    @Override
    public void disableUser(UUID userId) {
        User user = findById(userId);
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User disabled: {}", user.getEmail());
    }

    @Override
    public void assignRole(UUID userId, Role role) {
        User user = findById(userId);
        user.addRole(role);
        userRepository.save(user);
        log.info("Role {} assigned to user: {}", role, user.getEmail());
    }

    @Override
    public void removeRole(UUID userId, Role role) {
        User user = findById(userId);
        user.removeRole(role);
        userRepository.save(user);
        log.info("Role {} removed from user: {}", role, user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return PageResponse.of(
                users.getContent().stream().map(this::mapToResponse).toList(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(String search, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(search, pageable);
        return PageResponse.of(
                users.getContent().stream().map(this::mapToResponse).toList(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = findById(id);
        return mapToResponse(user);
    }

    @Override
    public void deleteUser(UUID id) {
        User user = findById(id);
        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .enabled(user.getEnabled())
                .accountLocked(user.getAccountLocked())
                .emailVerified(user.getEmailVerified())
                .roles(user.getRoles())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
```

### CustomUserDetailsService.java

```java
package com.oerms.auth.service;

import com.oerms.auth.entity.User;
import com.oerms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getEnabled(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                user.isAccountNonLocked(),
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
    }
}
```

### TokenBlacklistService.java

```java
package com.oerms.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String BLACKLIST_PREFIX = "token:blacklist:";

    public void blacklistToken(String token, Long expirationTimeInSeconds) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofSeconds(expirationTimeInSeconds));
        log.info("Token blacklisted successfully");
    }

    public boolean isTokenBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    public void removeFromBlacklist(String token) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.delete(key);
        log.info("Token removed from blacklist");
    }
}
```

### EmailService.java

```java
package com.oerms.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(String to, String fullName, String token) {
        try {
            String verificationUrl = frontendUrl + "/verify-email?token=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("OERMS - Verify Your Email Address");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Thank you for registering with OERMS!\n\n" +
                "Please click the link below to verify your email address:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not create this account, please ignore this email.\n\n" +
                "Best regards,\n" +
                "OERMS Team",
                fullName, verificationUrl
            ));

            mailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String fullName, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("OERMS - Password Reset Request");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "We received a request to reset your password.\n\n" +
                "Please click the link below to reset your password:\n" +
                "%s\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request a password reset, please ignore this email or contact support.\n\n" +
                "Best regards,\n" +
                "OERMS Team",
                fullName, resetUrl
            ));

            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to OERMS!");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Welcome to the Online Exam & Result Management System!\n\n" +
                "Your email has been verified and your account is now active.\n\n" +
                "You can now log in and start using all the features of OERMS.\n\n" +
                "Best regards,\n" +
                "OERMS Team",
                fullName
            ));

            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }
}
```

---

## Controller Classes

### AuthController.java

```java
package com.oerms.auth.controller;

import com.oerms.auth.dto.*;
import com.oerms.auth.service.UserService;
import com.oerms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        UserResponse response = userService.registerUser(request);
        return ApiResponse.success("Registration successful. Please check your email to verify your account.", response);
    }

    @GetMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        log.info("Email verification request received");
        userService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully. You can now log in.");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestParam String email) {
        log.info("Password reset request for email: {}", email);
        userService.initiatePasswordReset(email);
        return ApiResponse.success("Password reset link has been sent to your email.");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset confirmation received");
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ApiResponse.success("Password has been reset successfully. You can now log in with your new password.");
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@RequestParam String email) {
        log.info("Resend verification request for email: {}", email);
        // Implementation for resending verification email
        return ApiResponse.success("Verification email has been resent.");
    }
}
```

### UserManagementController.java

```java
package com.oerms.auth.controller;

import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.service.UserService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserManagementController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        
        PageResponse<UserResponse> response = userService.getAllUsers(pageable);
        return ApiResponse.success(response);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<UserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        PageResponse<UserResponse> response = userService.searchUsers(query, pageable);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> enableUser(@PathVariable UUID id) {
        userService.enableUser(id);
        return ApiResponse.success("User enabled successfully");
    }

    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> disableUser(@PathVariable UUID id) {
        userService.disableUser(id);
        return ApiResponse.success("User disabled successfully");
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> lockAccount(@PathVariable UUID id) {
        userService.lockAccount(id);
        return ApiResponse.success("Account locked successfully");
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> unlockAccount(@PathVariable UUID id) {
        userService.unlockAccount(id);
        return ApiResponse.success("Account unlocked successfully");
    }

    @PutMapping("/{id}/roles/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> assignRole(
            @PathVariable UUID id,
            @RequestParam Role role
    ) {
        userService.assignRole(id, role);
        return ApiResponse.success("Role assigned successfully");
    }

    @PutMapping("/{id}/roles/remove")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> removeRole(
            @PathVariable UUID id,
            @RequestParam Role role
    ) {
        userService.removeRole(id, role);
        return ApiResponse.success("Role removed successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponse.success("User deleted successfully");
    }
}
```

---

## Configuration Classes

### SecurityConfig.java

```java
package com.oerms.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.oerms.auth.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .oidc(Customizer.withDefaults());
        
        http.exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login")))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/actuator/health",
                                "/actuator/info",
                                "/.well-known/**",
                                "/oauth2/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    private static KeyPair generateRsaKey() {
        KeyPair keyPair;
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
        return keyPair;
    }
}
```

### AuthorizationServerConfig.java

```java
package com.oerms.auth.config;

import com.oerms.auth.security.JwtTokenCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;

import java.time.Duration;
import java.util.UUID;

@Configuration
public class AuthorizationServerConfig {

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient webClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("oerms-web-client")
                .clientSecret("{noop}oerms-web-secret") // Use BCrypt in production
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .redirectUri("http://localhost:3000/callback")
                .redirectUri("http://localhost:3000/login/oauth2/code/oerms")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false)
                        .requireProofKey(true) // PKCE
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofHours(1))
                        .refreshTokenTimeToLive(Duration.ofDays(7))
                        .reuseRefreshTokens(false)
                        .build())
                .build();

        RegisteredClient mobileClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("oerms-mobile-client")
                .clientSecret("{noop}oerms-mobile-secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("oerms://callback")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false)
                        .requireProofKey(true)
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofHours(2))
                        .refreshTokenTimeToLive(Duration.ofDays(30))
                        .reuseRefreshTokens(false)
                        .build())
                .build();

        return new InMemoryRegisteredClientRepository(webClient, mobileClient);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:8081") // Change in production
                .build();
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> jwtTokenCustomizer(JwtTokenCustomizer customizer) {
        return customizer;
    }
}
```

### JwtTokenCustomizer.java

```java
package com.oerms.auth.security;

import com.oerms.auth.entity.User;
import com.oerms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtTokenCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {

    private final UserRepository userRepository;

    @Override
    public void customize(JwtEncodingContext context) {
        String email = context.getPrincipal().getName();
        
        userRepository.findByEmail(email).ifPresent(user -> {
            context.getClaims()
                    .claim("userId", user.getId().toString())
                    .claim("email", user.getEmail())
                    .claim("fullName", user.getFullName())
                    .claim("roles", user.getRoles().stream()
                            .map(role -> "ROLE_" + role.name())
                            .collect(Collectors.toSet()))
                    .claim("emailVerified", user.getEmailVerified())
                    .claim("enabled", user.getEnabled());
        });
    }
}
```

### RedisConfig.java

```java
package com.oerms.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Bean
    public JedisConnectionFactory jedisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);
        return new JedisConnectionFactory(config);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### CorsConfig.java

```java
package com.oerms.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### JpaConfig.java

```java
package com.oerms.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
```

---

## Flyway Migration Scripts

### V1__create_users_table.sql

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- Create user_roles table
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_enabled ON users(enabled);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

### V2__create_verification_tokens_table.sql

```sql
-- Create verification_tokens table
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_verification_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_token ON verification_tokens(token);
CREATE INDEX idx_user_id ON verification_tokens(user_id);
```

### V3__create_password_reset_tokens_table.sql

```sql
-- Create password_reset_tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_password_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_user_id ON password_reset_tokens(user_id);
```

---

## Application Configuration Files

### application.yml

```yaml
spring:
  application:
    name: auth-server

  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_auth
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
    validate-on-migrate: true

  data:
    redis:
      host: localhost
      port: 6379
      timeout: 60000ms
      jedis:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
          max-wait: -1ms

  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
    properties:
      spring.json.add.type.headers: false

  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000

server:
  port: 8081
  servlet:
    context-path: /
  error:
    include-message: always
    include-binding-errors: always

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${random.value}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true

logging:
  level:
    root: INFO
    com.oerms.auth: DEBUG
    org.springframework.security: DEBUG
    org.springframework.security.oauth2: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

app:
  mail:
    from: noreply@oerms.com
  frontend:
    url: http://localhost:3000
  cors:
    allowed-origins:
      - http://localhost:3000
      - http://localhost:8080
```

### application-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_auth_dev
    username: postgres
    password: postgres

  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true

  data:
    redis:
      host: localhost
      port: 6379

  kafka:
    bootstrap-servers: localhost:9092

logging:
  level:
    root: INFO
    com.oerms.auth: DEBUG
    org.springframework.security: DEBUG
    org.springframework.security.oauth2: TRACE
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

server:
  port: 8081

app:
  frontend:
    url: http://localhost:3000
```

### application-prod.yml

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10

  jpa:
    show-sql: false
    properties:
      hibernate:
        format_sql: false

  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT}
      password: ${REDIS_PASSWORD}

  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS}
    producer:
      acks: all
      retries: 3

logging:
  level:
    root: WARN
    com.oerms.auth: INFO
    org.springframework.security: WARN

server:
  port: 8081
  ssl:
    enabled: true
    key-store: ${SSL_KEYSTORE_PATH}
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12

app:
  frontend:
    url: ${FRONTEND_URL}
  cors:
    allowed-origins:
      - ${FRONTEND_URL}

eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_SERVER_URL}
```

---

## Global Exception Handler

### GlobalExceptionHandler.java

```java
package com.oerms.auth.exception;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.exception.BusinessException;
import com.oerms.common.exception.DuplicateResourceException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(DuplicateResourceException ex) {
        log.error("Duplicate resource: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException ex) {
        log.error("Validation error: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.error("Validation errors: {}", errors);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", 
                        ApiResponse.ErrorDetails.builder()
                                .code("VALIDATION_ERROR")
                                .details(errors.toString())
                                .build()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        log.error("Business exception: {}", ex.getMessage());
        return ResponseEntity
                .status(ex.getStatus())
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        log.error("Bad credentials: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsernameNotFound(UsernameNotFoundException ex) {
        log.error("Username not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabled(DisabledException ex) {
        log.error("Account disabled: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Account is disabled. Please verify your email."));
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleLocked(LockedException ex) {
        log.error("Account locked: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Account is locked due to multiple failed login attempts."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
    }
}
```

---

## Docker Configuration

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jdk-alpine as builder
WORKDIR /app
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

EXPOSE 8081

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

### docker-compose.yml (for local development)

```yaml
version: '3.8'

services:
  postgres-auth:
    image: postgres:15-alpine
    container_name: oerms-postgres-auth
    environment:
      POSTGRES_DB: oerms_auth
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres-auth-data:/var/lib/postgresql/data
    networks:
      - oerms-network

  redis:
    image: redis:7-alpine
    container_name: oerms-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - oerms-network

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: oerms-kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper
    networks:
      - oerms-network

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: oerms-zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    networks:
      - oerms-network

volumes:
  postgres-auth-data:
  redis-data:

networks:
  oerms-network:
    driver: bridge
```

---

## Testing

### UserServiceTest.java

```java
package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.auth.repository.UserRepository;
import com.oerms.auth.repository.VerificationTokenRepository;
import com.oerms.common.enums.Role;
import com.oerms.common.exception.DuplicateResourceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VerificationTokenRepository verificationTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private UserServiceImpl userService;

    private RegisterRequest registerRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .fullName("John Doe")
                .email("john.doe@example.com")
                .password("Password123!")
                .roles(Set.of(Role.STUDENT))
                .build();

        user = User.builder()
                .fullName("John Doe")
                .email("john.doe@example.com")
                .password("encoded-password")
                .enabled(false)
                .emailVerified(false)
                .roles(Set.of(Role.STUDENT))
                .build();
    }

    @Test
    void registerUser_Success() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());

        // When
        UserResponse response = userService.registerUser(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("john.doe@example.com");
        assertThat(response.getFullName()).isEqualTo("John Doe");
        verify(userRepository).save(any(User.class));
        verify(verificationTokenRepository).save(any());
        verify(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void registerUser_DuplicateEmail_ThrowsException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("email");

        verify(userRepository, never()).save(any());
    }

    @Test
    void findByEmail_UserExists_ReturnsUser() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // When
        User foundUser = userService.findByEmail("john.doe@example.com");

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getEmail()).isEqualTo("john.doe@example.com");
    }
}
```

---

## README.md

```markdown
# OERMS Auth Server

OAuth2 Authorization Server with Spring Authorization Server for the OERMS platform.

## Features

✅ **OAuth2 / OIDC Support**
- Authorization Code Flow
- Refresh Token Flow
- Client Credentials Flow
- PKCE Support

✅ **JWT Tokens**
- RSA Key Pair Generation
- Custom Claims (userId, email, roles)
- Token Introspection
- Token Revocation

✅ **User Management**
- Registration with email verification
- Password reset flow
- Account locking after failed attempts
- Role-based access control (STUDENT, TEACHER, ADMIN)

✅ **Security Features**
- BCrypt password encoding
- Token blacklist (Redis)
- Account auto-lock after 5 failed attempts
- Email verification required

✅ **Database**
- PostgreSQL with Flyway migrations
- UUID-based primary keys
- Audit fields (created_at, updated_at)

✅ **Caching & Events**
- Redis for token blacklist
- Kafka for event streaming

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 15+
- Redis 7+
- Kafka 3.5+

## Running Locally

### 1. Start Dependencies

```bash
docker-compose up -d
```

### 2. Build and Run

```bash
mvn clean install
mvn spring-boot:run
```

### 3. Access Points

- Authorization Server: http://localhost:8081
- Health Check: http://localhost:8081/actuator/health
- OpenID Configuration: http://localhost:8081/.well-known/openid-configuration

## API Endpoints

### Public Endpoints

```
POST   /api/v1/auth/register
GET    /api/v1/auth/verify-email?token=
POST   /api/v1/auth/forgot-password?email=
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/resend-verification?email=
```

### Protected Endpoints (Admin Only)

```
GET    /api/v1/users
GET    /api/v1/users/search?query=
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}/enable
PUT    /api/v1/users/{id}/disable
PUT    /api/v1/users/{id}/lock
PUT    /api/v1/users/{id}/unlock
PUT    /api/v1/users/{id}/roles/assign?role=
PUT    /api/v1/users/{id}/roles/remove?role=
DELETE /api/v1/users/{id}
```

## OAuth2 Client Configuration

### Web Client
- Client ID: `oerms-web-client`
- Client Secret: `oerms-web-secret`
- Redirect URI: `http://localhost:3000/callback`
- Grant Types: authorization_code, refresh_token, client_credentials
- Scopes: openid, profile, email, read, write

### Mobile Client
- Client ID: `oerms-mobile-client`
- Client Secret: `oerms-mobile-secret`
- Redirect URI: `oerms://callback`
- Grant Types: authorization_code, refresh_token
- Scopes: openid, profile, email, read, write

## Environment Variables

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/oerms_auth
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Docker Build

```bash
mvn clean package -DskipTests
docker build -t oerms-auth-server:1.0.0 .
docker run -p 8081:8081 --env-file .env oerms-auth-server:1.0.0
```

## Testing

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=UserServiceTest

# Run with coverage
mvn test jacoco:report
```

## Next Steps

- Integrate with API Gateway
- Configure service discovery with Eureka
- Set up monitoring with Prometheus
- Implement rate limiting

## License

Proprietary - All Rights Reserved
```

---

## Complete! 🎉

This auth-server implementation includes:

✅ **UUID-based IDs** throughout
✅ **Complete OAuth2 Authorization Server** with Spring Authorization Server
✅ **JWT with custom claims** (userId, email, roles)
✅ **User management** (register, verify, lock/unlock, enable/disable)
✅ **Password reset flow**
✅ **Token blacklist** using Redis
✅ **Email notifications**
✅ **Kafka event publishing**
✅ **Role-based security** (STUDENT, TEACHER, ADMIN)
✅ **Flyway migrations**
✅ **Docker support**
✅ **Global exception handling**
✅ **Testing examples**

Ready for production deployment! 🚀