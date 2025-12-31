# Common Module

The **Common Module** is a shared library used across all microservices in the OERMS (Online Exam & Result Management System). It contains shared DTOs, Enums, Events, Exceptions, Utilities, and Base Entities to ensure consistency and reduce code duplication.

## Features

*   **Shared DTOs**: Standardized Data Transfer Objects for API responses, requests, and inter-service communication.
*   **Enums**: Common enumerations like `Role`, `ExamStatus`, `QuestionType`, etc.
*   **Events**: Kafka event classes for event-driven architecture (e.g., `UserRegisteredEvent`, `ExamPublishedEvent`).
*   **Exceptions**: Custom exception classes (`ResourceNotFoundException`, `BadRequestException`) and a global exception handler structure.
*   **Base Entity**: A `BaseEntity` class with common fields like `id`, `createdAt`, `updatedAt` for JPA entities.
*   **Utilities**: Helper classes like `JwtUtils` for handling JWT tokens.

## Project Structure

```
com.oerms.common
├── constant        # Constant values
├── dto             # Data Transfer Objects (ApiResponse, PageResponse, etc.)
├── entity          # Base JPA Entities (BaseEntity)
├── enums           # Enumerations (Role, ExamStatus, etc.)
├── event           # Kafka Event classes
├── exception       # Custom Exceptions
└── util            # Utility classes (JwtUtils)
```

## Key Components

### DTOs
*   `ApiResponse<T>`: Standard wrapper for all API responses.
*   `PageResponse<T>`: Standard wrapper for paginated responses.
*   `ErrorResponse`: Standard error structure.
*   `UserRegistrationDTO`, `ExamDTO`, `QuestionDTO`, etc.

### Enums
*   `Role`: STUDENT, TEACHER, ADMIN
*   `ExamStatus`: DRAFT, PUBLISHED, ONGOING, COMPLETED, ARCHIVED
*   `QuestionType`: MCQ, TRUE_FALSE, SHORT_ANSWER
*   `AttemptStatus`: IN_PROGRESS, SUBMITTED, COMPLETED

### Events
*   `UserRegisteredEvent`: Triggered when a user registers.
*   `ExamPublishedEvent`: Triggered when an exam is published.
*   `ExamStartedEvent`: Triggered when a student starts an exam.
*   `ResultPublishedEvent`: Triggered when results are released.

### Exceptions
*   `ResourceNotFoundException`
*   `ResourceAlreadyExistsException`
*   `BadRequestException`
*   `UnauthorizedException`
*   `ForbiddenException`

### Utilities
*   `JwtUtils`: Provides static methods to extract user ID and roles from `Authentication` objects.

## Usage

This module is included as a dependency in other microservices:

```xml
<dependency>
    <groupId>com.oerms</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Build

To build and install this module into your local Maven repository so other services can use it:

```bash
./mvnw clean install
```
