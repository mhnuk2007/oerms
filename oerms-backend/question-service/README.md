# Question Service

The **Question Service** manages the repository of questions for exams in the OERMS (Online Exam & Result Management System). It handles the creation, storage, and retrieval of various question types, including multiple-choice, true/false, and short answer questions.

## Features

*   **Question Management**: Create, read, update, and delete questions.
*   **Bulk Operations**: Create multiple questions at once.
*   **Question Types**: Supports Multiple Choice (MCQ), True/False, and Short Answer.
*   **Student View**: Provides a sanitized view of questions (without answers) for students taking exams.
*   **Grading Support**: Provides correct answers to internal services for automated grading.
*   **Statistics**: Generates statistics on question difficulty and types for an exam.
*   **Duplication**: Supports duplicating all questions from one exam to another (for templates).

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Data JPA** (PostgreSQL)
*   **Spring Cloud Netflix Eureka Client**
*   **Spring Cloud OpenFeign**
*   **Redis** (Caching)
*   **Hypersistence Utils** (JSON support)

## Prerequisites

Before running the Question Service, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **PostgreSQL**: Database `oerms_question` must exist.
3.  **Redis**: Running on port `6379`.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `9003`
*   **Database**: `jdbc:postgresql://localhost:5432/oerms_question`
*   **Redis**: `localhost:6379`

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/question-service-1.0.0.jar
```

## API Documentation

The API documentation is available via Swagger UI:

*   **Swagger UI**: [http://localhost:9003/swagger-ui.html](http://localhost:9003/swagger-ui.html)
*   **OpenAPI JSON**: [http://localhost:9003/v3/api-docs](http://localhost:9003/v3/api-docs)

## Key Endpoints

### Teacher/Admin Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/questions` | Create a new question |
| `POST` | `/api/questions/bulk` | Bulk create questions |
| `GET` | `/api/questions/exam/{examId}` | Get all questions (with answers) |
| `PUT` | `/api/questions/{id}` | Update a question |
| `DELETE` | `/api/questions/{id}` | Delete a question |
| `POST` | `/api/questions/exam/{source}/duplicate/{target}` | Duplicate questions to another exam |
| `GET` | `/api/questions/exam/{examId}/statistics` | Get question statistics |

### Student Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/questions/exam/{examId}/student` | Get questions (without answers) |

### Internal Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/questions/internal/batch` | Get questions by IDs (for grading) |

## Database Schema

The `Question` entity includes:
*   `examId` (UUID)
*   `questionText`
*   `type` (MCQ, TRUE_FALSE, etc.)
*   `marks`
*   `options` (List of strings)
*   `correctAnswer`
*   `explanation`
*   `difficultyLevel`
*   `imageUrl`
