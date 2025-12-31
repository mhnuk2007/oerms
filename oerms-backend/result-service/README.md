# Result Service

The **Result Service** is responsible for grading exam attempts, generating results, and providing detailed analytics in the OERMS (Online Exam & Result Management System). It consumes events from the `attempt-service` to trigger the grading process.

## Features

*   **Automated Grading**: Automatically grades objective questions (MCQ, True/False).
*   **Manual Grading Support**: Provides endpoints for teachers to grade subjective questions.
*   **Result Management**: Publishes and unpublishes results.
*   **Analytics & Statistics**:
    *   Calculates scores, percentages, grades, and ranks.
    *   Provides statistics for exams (average score, pass rate) and students (performance trends).
*   **Event Driven**:
    *   Consumes `AttemptSubmittedEvent` from Kafka to start the grading process.
    *   Publishes `ResultPublishedEvent` to Kafka for notifications.
*   **Integration**:
    *   Fetches attempt data from **Attempt Service**.
    *   Fetches question data from **Question Service** for grading.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Data JPA** (PostgreSQL)
*   **Spring Cloud Netflix Eureka Client**
*   **Spring Cloud OpenFeign**
*   **Resilience4j** (Circuit Breaker, Retry, TimeLimiter)
*   **Apache Kafka** (Consumer/Producer)
*   **Redis** (Caching)

## Prerequisites

Before running the Result Service, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **PostgreSQL**: Database `oerms_result` must exist.
3.  **Redis**: Running on port `6379`.
4.  **Kafka**: Running on port `9092`.
5.  **Attempt Service**: For fetching attempt details.
6.  **Question Service**: For fetching correct answers.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `9005`
*   **Database**: `jdbc:postgresql://localhost:5432/oerms_result`
*   **Redis**: `localhost:6379`
*   **Kafka**: `localhost:9092`
*   **Service URLs**:
    *   Attempt Service: `http://localhost:9004`
    *   Question Service: `http://localhost:9003`

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/result-service-1.0.0.jar
```

## API Documentation

The API documentation is available via Swagger UI:

*   **Swagger UI**: [http://localhost:9005/swagger-ui.html](http://localhost:9005/swagger-ui.html)
*   **OpenAPI JSON**: [http://localhost:9005/v3/api-docs](http://localhost:9005/v3/api-docs)

## Key Endpoints

### Student Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/results/my-results` | Get all published results for the current student |
| `GET` | `/api/results/{id}` | Get a specific result |
| `GET` | `/api/results/{id}/details` | Get detailed result with question analysis |

### Teacher/Admin Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/results/exam/{examId}` | Get all results for a specific exam |
| `POST` | `/api/results/{id}/publish` | Publish a result to make it visible |
| `POST` | `/api/results/{id}/grade` | Manually grade subjective questions |
| `GET` | `/api/results/exam/{examId}/statistics` | Get detailed statistics for an exam |
| `GET` | `/api/results/pending-grading` | Get results that require manual grading |

## Database Schema

The `Result` entity includes:
*   `attemptId`, `examId`, `studentId`
*   `totalMarks`, `obtainedMarks`, `percentage`
*   `passed` (Boolean), `grade`, `rank`
*   `status` (DRAFT, PUBLISHED, etc.)
*   `correctAnswers`, `wrongAnswers`, `unanswered`
*   `gradedAt`, `publishedAt`
*   `suspiciousActivity` (Boolean)
