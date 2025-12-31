# Attempt Service

The **Attempt Service** is responsible for managing student exam attempts in the OERMS (Online Exam & Result Management System). It handles the entire lifecycle of an attempt, from starting the exam to saving answers and final submission.

## Features

*   **Attempt Lifecycle**: Start, pause, resume, and submit exam attempts.
*   **Answer Management**: Save, update, and clear answers for questions.
*   **Proctoring**: Records proctoring events like tab switches and webcam violations.
*   **Auto-Save**: Periodically saves student progress.
*   **Event Driven**: Publishes events to Kafka when an attempt is submitted for grading.
*   **Integration**:
    *   Called by **Exam Service** to initiate an attempt.
    *   Calls **Question Service** to validate answers.
    *   Publishes to **Result Service** (via Kafka) for grading.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Data JPA** (PostgreSQL)
*   **Spring Cloud Netflix Eureka Client**
*   **Spring Cloud OpenFeign**
*   **Apache Kafka** (Producer)
*   **Redis** (Caching)
*   **Hypersistence Utils** (JSON support)

## Prerequisites

Before running the Attempt Service, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **PostgreSQL**: Database `oerms_attempt` must exist.
3.  **Redis**: Running on port `6379`.
4.  **Kafka**: Running on port `9092`.
5.  **Question Service**: For fetching question details.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `9004`
*   **Database**: `jdbc:postgresql://localhost:5432/oerms_attempt`
*   **Redis**: `localhost:6379`
*   **Kafka**: `localhost:9092`
*   **Question Service URL**: `http://localhost:9003`

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/attempt-service-1.0.0.jar
```

## API Documentation

The API documentation is available via Swagger UI:

*   **Swagger UI**: [http://localhost:9004/swagger-ui.html](http://localhost:9004/swagger-ui.html)
*   **OpenAPI JSON**: [http://localhost:9004/v3/api-docs](http://localhost:9004/v3/api-docs)

## Key Endpoints

### Student Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/attempts/start` | Start a new exam attempt |
| `POST` | `/api/attempts/{id}/answers` | Save an answer |
| `POST` | `/api/attempts/submit` | Submit the final attempt |
| `GET` | `/api/attempts/my-attempts` | Get all attempts for the current student |
| `POST` | `/api/attempts/{id}/tab-switch` | Record a proctoring violation |

### Teacher/Admin Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/attempts/exam/{examId}` | Get all attempts for a specific exam |
| `GET` | `/api/attempts/{id}` | Get detailed information for a single attempt |
| `GET` | `/api/attempts/suspicious` | Get attempts flagged for suspicious activity |

## Database Schema

### `ExamAttempt` Entity
*   `examId`, `studentId`
*   `status` (IN_PROGRESS, SUBMITTED, etc.)
*   `startedAt`, `submittedAt`, `timeTakenSeconds`
*   `totalQuestions`, `answeredQuestions`
*   Proctoring fields: `tabSwitches`, `webcamViolations`

### `AttemptAnswer` Entity
*   `attempt` (ManyToOne relationship)
*   `questionId`
*   `selectedOptions` (Set of strings for MCQ)
*   `answerText` (for short answers)
*   `flagged` (for review)
