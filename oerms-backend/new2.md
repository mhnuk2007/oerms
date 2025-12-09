# OERMS Parent & Common Module - Complete Code Files

## Project Structure
```
oerms-parent/
├── pom.xml
├── common/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── oerms/
│           │           └── common/
│           │               ├── entity/
│           │               │   └── BaseEntity.java
│           │               ├── dto/
│           │               │   ├── ApiResponse.java
│           │               │   ├── PageResponse.java
│           │               │   └── PageRequest.java
│           │               ├── exception/
│           │               │   ├── BusinessException.java
│           │               │   ├── ResourceNotFoundException.java
│           │               │   ├── ValidationException.java
│           │               │   ├── UnauthorizedException.java
│           │               │   └── DuplicateResourceException.java
│           │               ├── constant/
│           │               │   ├── AppConstants.java
│           │               │   └── ErrorCodes.java
│           │               └── util/
│           │                   ├── DateUtils.java
│           │                   ├── StringUtils.java
│           │                   └── ValidationUtils.java
│           └── resources/
│               └── application.yml (empty - no configs needed)
└── README.md
```

---

## Additional Important Files

### common/src/main/java/com/oerms/common/enums/Role.java
```java
package com.oerms.common.enums;

/**
 * User roles in the system
 */
public enum Role {
    STUDENT("Student - Can take exams and view results"),
    TEACHER("Teacher - Can create exams and questions"),
    ADMIN("Admin - Full system access");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public String getRoleWithPrefix() {
        return "ROLE_" + this.name();
    }
}
```

### common/src/main/java/com/oerms/common/enums/ExamStatus.java
```java
package com.oerms.common.enums;

/**
 * Exam lifecycle status
 */
public enum ExamStatus {
    DRAFT("Draft - Being created"),
    PUBLISHED("Published - Visible to students"),
    ACTIVE("Active - Currently ongoing"),
    COMPLETED("Completed - Ended");

    private final String description;

    ExamStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

### common/src/main/java/com/oerms/common/enums/QuestionType.java
```java
package com.oerms.common.enums;

/**
 * Types of questions supported
 */
public enum QuestionType {
    MCQ("Multiple Choice Question"),
    TRUE_FALSE("True/False Question"),
    SHORT_ANSWER("Short Answer Question"),
    ESSAY("Essay Question");

    private final String description;

    QuestionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isAutoGradable() {
        return this == MCQ || this == TRUE_FALSE;
    }
}
```

### common/src/main/java/com/oerms/common/enums/AttemptStatus.java
```java
package com.oerms.common.enums;

/**
 * Status of exam attempt
 */
public enum AttemptStatus {
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    SUBMITTED("Submitted"),
    EXPIRED("Expired - Time ran out"),
    EVALUATED("Evaluated");

    private final String description;

    AttemptStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

### common/src/main/java/com/oerms/common/enums/DifficultyLevel.java
```java
package com.oerms.common.enums;

/**
 * Difficulty levels for exams and questions
 */
public enum DifficultyLevel {
    EASY("Easy"),
    MEDIUM("Medium"),
    HARD("Hard"),
    EXPERT("Expert");

    private final String description;

    DifficultyLevel(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

### common/src/main/java/com/oerms/common/enums/NotificationType.java
```java
package com.oerms.common.enums;

/**
 * Types of notifications
 */
public enum NotificationType {
    EMAIL("Email Notification"),
    SMS("SMS Notification"),
    PUSH("Push Notification"),
    IN_APP("In-App Notification");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

### common/src/main/java/com/oerms/common/event/BaseEvent.java
```java
package com.oerms.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class for all domain events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventId = UUID.randomUUID().toString();
    private LocalDateTime eventTime = LocalDateTime.now();
    private String eventType;
    private String source;

    public BaseEvent(String eventType, String source) {
        this.eventType = eventType;
        this.source = source;
        this.eventId = UUID.randomUUID().toString();
        this.eventTime = LocalDateTime.now();
    }
}
```

### common/src/main/java/com/oerms/common/event/UserCreatedEvent.java
```java
package com.oerms.common.event;

import lombok.*;

/**
 * Event published when a new user is created
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserCreatedEvent extends BaseEvent {

    private Long userId;
    private String email;
    private String fullName;
    private String role;

    public UserCreatedEvent(Long userId, String email, String fullName, String role) {
        super("USER_CREATED", "user-service");
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}
```

### common/src/main/java/com/oerms/common/event/ExamPublishedEvent.java
```java
package com.oerms.common.event;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Event published when an exam is published
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ExamPublishedEvent extends BaseEvent {

    private Long examId;
    private String examTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long createdBy;

    public ExamPublishedEvent(Long examId, String examTitle, LocalDateTime startTime, 
                              LocalDateTime endTime, Long createdBy) {
        super("EXAM_PUBLISHED", "exam-service");
        this.examId = examId;
        this.examTitle = examTitle;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdBy = createdBy;
    }
}
```

### common/src/main/java/com/oerms/common/event/ResultPublishedEvent.java
```java
package com.oerms.common.event;

import lombok.*;

/**
 * Event published when result is published
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ResultPublishedEvent extends BaseEvent {

    private Long resultId;
    private Long attemptId;
    private Long studentId;
    private Long examId;
    private Double obtainedMarks;
    private Double totalMarks;
    private Double percentage;
    private Boolean passed;

    public ResultPublishedEvent(Long resultId, Long attemptId, Long studentId, Long examId,
                                Double obtainedMarks, Double totalMarks, Double percentage, 
                                Boolean passed) {
        super("RESULT_PUBLISHED", "result-service");
        this.resultId = resultId;
        this.attemptId = attemptId;
        this.studentId = studentId;
        this.examId = examId;
        this.obtainedMarks = obtainedMarks;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.passed = passed;
    }
}
```

### common/src/main/java/com/oerms/common/util/JsonUtils.java
```java
package com.oerms.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Utility class for JSON operations
 */
public final class JsonUtils {

    private JsonUtils() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    public static String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting object to JSON", e);
        }
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing JSON to object", e);
        }
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
```

### common/src/main/java/com/oerms/common/util/PasswordUtils.java
```java
package com.oerms.common.util;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for password operations
 */
public final class PasswordUtils {

    private PasswordUtils() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*";
    private static final String ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

    public static String generateRandomPassword(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("Password length must be at least 8");
        }

        StringBuilder password = new StringBuilder(length);
        
        // Ensure at least one of each type
        password.append(UPPERCASE.charAt(secureRandom.nextInt(UPPERCASE.length())));
        password.append(LOWERCASE.charAt(secureRandom.nextInt(LOWERCASE.length())));
        password.append(DIGITS.charAt(secureRandom.nextInt(DIGITS.length())));
        password.append(SPECIAL.charAt(secureRandom.nextInt(SPECIAL.length())));

        // Fill the rest randomly
        for (int i = 4; i < length; i++) {
            password.append(ALL_CHARS.charAt(secureRandom.nextInt(ALL_CHARS.length())));
        }

        // Shuffle the password
        return shuffleString(password.toString());
    }

    public static String generateToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.encodeToString(randomBytes);
    }

    private static String shuffleString(String input) {
        char[] characters = input.toCharArray();
        for (int i = characters.length - 1; i > 0; i--) {
            int j = secureRandom.nextInt(i + 1);
            char temp = characters[i];
            characters[i] = characters[j];
            characters[j] = temp;
        }
        return new String(characters);
    }

    public static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (SPECIAL.indexOf(c) >= 0) hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
```

### common/src/main/java/com/oerms/common/util/FileUtils.java
```java
package com.oerms.common.util;

import com.oerms.common.constant.AppConstants;
import com.oerms.common.exception.ValidationException;

import java.util.Arrays;

/**
 * Utility class for file operations
 */
public final class FileUtils {

    private FileUtils() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    public static void validateImageFile(String contentType, long size) {
        if (size > AppConstants.MAX_FILE_SIZE) {
            throw new ValidationException(
                String.format("File size exceeds maximum allowed size of %d bytes", 
                    AppConstants.MAX_FILE_SIZE)
            );
        }

        if (!Arrays.asList(AppConstants.ALLOWED_IMAGE_TYPES).contains(contentType)) {
            throw new ValidationException(
                "Invalid file type. Allowed types: " + 
                String.join(", ", AppConstants.ALLOWED_IMAGE_TYPES)
            );
        }
    }

    public static void validateDocumentFile(String contentType, long size) {
        if (size > AppConstants.MAX_FILE_SIZE) {
            throw new ValidationException(
                String.format("File size exceeds maximum allowed size of %d bytes", 
                    AppConstants.MAX_FILE_SIZE)
            );
        }

        if (!Arrays.asList(AppConstants.ALLOWED_DOCUMENT_TYPES).contains(contentType)) {
            throw new ValidationException(
                "Invalid file type. Allowed types: " + 
                String.join(", ", AppConstants.ALLOWED_DOCUMENT_TYPES)
            );
        }
    }

    public static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    public static String generateUniqueFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return StringUtils.generateUUID() + (extension.isEmpty() ? "" : "." + extension);
    }
}
```

---

## README.md

```markdown
# OERMS - Online Exam & Result Management System

## Parent & Common Module

This is the parent module for the OERMS microservices architecture.

### Modules Overview

- **common**: Shared utilities, DTOs, entities, and exceptions
- **system-registry**: Eureka service discovery server
- **auth-server**: OAuth2 Authorization Server
- **api-gateway**: Spring Cloud Gateway for routing
- **user-service**: User profile management
- **exam-service**: Exam creation and management
- **question-service**: Question bank management
- **attempt-service**: Exam attempt handling
- **result-service**: Result evaluation and publishing
- **notification-service**: Multi-channel notifications

### Technology Stack

- Java 17
- Spring Boot 3.2.5
- Spring Cloud 2023.0.1
- PostgreSQL (per service)
- Redis (caching & session)
- Kafka (event streaming)
- Docker & Docker Compose

### Common Module Structure

The common module contains:

#### Entities
- `BaseEntity`: Base class with audit fields (id, createdAt, updatedAt, version)

#### DTOs
- `ApiResponse<T>`: Standard API response wrapper
- `PageResponse<T>`: Pagination response
- `PageRequest`: Pagination request parameters

#### Exceptions
- `BusinessException`: Base business exception
- `ResourceNotFoundException`: 404 errors
- `ValidationException`: Validation errors
- `UnauthorizedException`: 401 errors
- `DuplicateResourceException`: 409 errors

#### Enums
- `Role`: STUDENT, TEACHER, ADMIN
- `ExamStatus`: DRAFT, PUBLISHED, ACTIVE, COMPLETED
- `QuestionType`: MCQ, TRUE_FALSE, SHORT_ANSWER, ESSAY
- `AttemptStatus`: NOT_STARTED, IN_PROGRESS, SUBMITTED, EXPIRED, EVALUATED
- `DifficultyLevel`: EASY, MEDIUM, HARD, EXPERT
- `NotificationType`: EMAIL, SMS, PUSH, IN_APP

#### Events
- `BaseEvent`: Base event class
- `UserCreatedEvent`: Published when user is created
- `ExamPublishedEvent`: Published when exam is published
- `ResultPublishedEvent`: Published when result is available

#### Utilities
- `DateUtils`: Date/time operations
- `StringUtils`: String operations and UUID generation
- `ValidationUtils`: Validation helpers
- `JsonUtils`: JSON serialization/deserialization
- `PasswordUtils`: Password generation and validation
- `FileUtils`: File validation and naming

#### Constants
- `AppConstants`: Application-wide constants
- `ErrorCodes`: Centralized error codes

### Important Notes

⚠️ **Bean Conflict Prevention**:
The common module contains NO `@Service`, `@Component`, or `@Configuration` annotated classes. This prevents duplicate bean scanning issues across microservices.

### Building the Project

```bash
# Build parent and common
mvn clean install

# Build specific module
cd user-service
mvn clean package

# Build all modules
mvn clean install -DskipTests
```

### Next Steps

1. Generate individual microservice modules
2. Configure service discovery
3. Set up OAuth2 Authorization Server
4. Implement API Gateway routing
5. Create domain services

### Contributors

OERMS Development Team

### License

Proprietary - All Rights Reserved
```

---

## .gitignore

```
# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# IDE
.idea/
*.iml
.vscode/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log

# Application
application-local.yml
application-dev.yml
application-prod.yml

# Docker
docker-compose.override.yml

# Other
.classpath
.project
.settings/
bin/
```

---

## Maven Build Instructions

1. **Install Parent POM**:
```bash
cd oerms-parent
mvn clean install
```

2. **Build Common Module**:
```bash
cd common
mvn clean install
```

3. **Use Common in Other Services**:
   Add dependency in service pom.xml:
```xml
<dependency>
    <groupId>com.oerms</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0</version>
</dependency>
```

4. **Enable JPA Auditing** in each service:
```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
```

---

## Key Features

✅ **Clean Architecture**: Separation of concerns
✅ **No Bean Conflicts**: Common module has no Spring beans
✅ **Comprehensive DTOs**: Standard response formats
✅ **Rich Exception Handling**: Typed exceptions with error codes
✅ **Utility Classes**: Reusable helper methods
✅ **Event-Driven**: Base classes for domain events
✅ **Type Safety**: Enums for all categorical data
✅ **Audit Support**: BaseEntity with automatic timestamps
✅ **Validation**: Built-in validation utilities
✅ **JSON Support**: Easy serialization/deserialization

---

This completes the OERMS Parent and Common modules. Ready for microservice development!