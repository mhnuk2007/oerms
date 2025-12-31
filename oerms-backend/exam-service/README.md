# Exam Service

The **Exam Service** is the core component of the OERMS (Online Exam & Result Management System) responsible for the entire lifecycle of exams. It handles exam creation, scheduling, publishing, and student participation.

## Features

*   **Exam Management**: Create, update, delete, and duplicate exams.
*   **Lifecycle Management**: Publish, unpublish, archive, and cancel exams.
*   **Scheduling**: Set start/end times, duration, and deadlines.
*   **Templates**: Create reusable exam templates.
*   **Student Access**: Check availability, prerequisites, and start exams.
*   **Configuration**: Advanced settings like shuffle questions, negative marking, webcam requirement, etc.
*   **Integration**:
    *   Communicates with **Question Service** to fetch questions.
    *   Communicates with **Attempt Service** to initiate student attempts.
*   **Resiliency**: Uses Circuit Breakers (Resilience4j) for downstream service calls.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Data JPA** (PostgreSQL)
*   **Spring Cloud Netflix Eureka Client**
*   **Spring Cloud OpenFeign**
*   **Resilience4j** (Circuit Breaker, Retry, TimeLimiter)
*   **Apache Kafka** (Producer/Consumer)
*   **Redis** (Caching)
*   **Spring Scheduler** (Automated tasks)

## Prerequisites

Before running the Exam Service, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **PostgreSQL**: Database `oerms_exam` must exist.
3.  **Redis**: Running on port `6379`.
4.  **Kafka**: Running on port `9092`.
5.  **Question Service**: For question validation.
6.  **Attempt Service**: For starting attempts.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `9002`
*   **Database**: `jdbc:postgresql://localhost:5432/oerms_exam`
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
java -jar target/exam-service-1.0.0.jar
```

## API Documentation

The API documentation is available via Swagger UI:

*   **Swagger UI**: [http://localhost:9002/swagger-ui.html](http://localhost:9002/swagger-ui.html)
*   **OpenAPI JSON**: [http://localhost:9002/v3/api-docs](http://localhost:9002/v3/api-docs)

## Key Endpoints

### Exam Management (Teacher/Admin)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/exams` | Create a new exam (Draft) |
| `PUT` | `/api/exams/{id}` | Update an exam |
| `DELETE` | `/api/exams/{id}` | Delete an exam |
| `POST` | `/api/exams/{id}/publish` | Publish an exam |
| `POST` | `/api/exams/{id}/duplicate` | Duplicate an exam |
| `POST` | `/api/exams/{id}/create-template` | Create a template from an exam |

### Student Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/exams/available-for-me` | Get available exams |
| `POST` | `/api/exams/{id}/start` | Start an exam (creates attempt) |
| `GET` | `/api/exams/{id}/prerequisites` | Check prerequisites |

### Search & Query
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/exams/search` | Advanced search (title, subject, dates, etc.) |
| `GET` | `/api/exams/upcoming` | Get upcoming exams |
| `GET` | `/api/exams/teacher/{teacherId}` | Get exams by teacher |

## Database Schema

The `Exam` entity includes:
*   `title`, `description`, `subject`
*   `teacherId` (UUID)
*   `startTime`, `endTime`, `duration`
*   `totalMarks`, `passingMarks`
*   `status` (DRAFT, PUBLISHED, etc.)
*   `isTemplate`, `templateName`
*   **Configuration Flags**: `shuffleQuestions`, `webcamRequired`, `negativeMarking`, etc.

## Scheduled Tasks

The service runs several background tasks:
*   **Auto-Start**: Starts scheduled exams.
*   **Auto-Complete**: Completes exams that have exceeded their duration.
*   **Archive**: Archives old exams.
*   **Reminders**: Sends reminders for upcoming exams.
