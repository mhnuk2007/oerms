# User Service

The **User Service** manages user profiles and related data for the OERMS (Online Exam & Result Management System). It consumes registration events from the Auth Server to create initial profiles and provides APIs for users to update their personal information, including profile pictures.

## Features

*   **Profile Management**: Create, read, update, and delete user profiles.
*   **Event Driven**: Automatically creates a profile when a `UserRegisteredEvent` is received from Kafka.
*   **File Storage**: Handles profile picture uploads (stored locally or via MinIO).
*   **Search & Filtering**: Admin APIs to search profiles by name, city, or institution.
*   **Statistics**: Provides profile completion and activity statistics.
*   **Caching**: Uses Redis to cache profile data for faster retrieval.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Data JPA** (PostgreSQL)
*   **Spring Cloud Netflix Eureka Client**
*   **Spring Cloud OpenFeign**
*   **Apache Kafka** (Consumer)
*   **Redis** (Caching)
*   **MinIO** (Optional Object Storage)
*   **Flyway** (Database Migration)

## Prerequisites

Before running the User Service, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **PostgreSQL**: Database `oerms_user` must exist.
3.  **Redis**: Running on port `6379`.
4.  **Kafka**: Running on port `9092`.
5.  **Auth Server**: For JWT validation (issuer URI).

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `9001`
*   **Database**: `jdbc:postgresql://localhost:5432/oerms_user`
*   **Redis**: `localhost:6379`
*   **Kafka**: `localhost:9092`
*   **File Upload**:
    *   Directory: `./uploads/profiles`
    *   Max Size: 10MB

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/user-service-1.0.0.jar
```

## API Documentation

The API documentation is available via Swagger UI:

*   **Swagger UI**: [http://localhost:9001/swagger-ui.html](http://localhost:9001/swagger-ui.html)
*   **OpenAPI JSON**: [http://localhost:9001/v3/api-docs](http://localhost:9001/v3/api-docs)

## Key Endpoints

### Profile Management (User)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profiles/profile/me` | Get current user's profile |
| `PUT` | `/api/profiles/profile/me` | Update current user's profile |
| `POST` | `/api/profiles/profile/me/picture` | Upload profile picture |
| `DELETE` | `/api/profiles/profile/me/picture` | Delete profile picture |
| `PUT` | `/api/profiles/profile/me/institution` | Update institution |
| `DELETE` | `/api/profiles/profile/me/institution` | Remove institution |

### Profile Management (Admin)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profiles` | Get all profiles (paginated) |
| `GET` | `/api/profiles/all/search` | Search profiles by keyword |
| `GET` | `/api/profiles/all/city/{city}` | Filter profiles by city |
| `GET` | `/api/profiles/all/institution/{inst}` | Filter profiles by institution |
| `GET` | `/api/profiles/stats` | Get profile statistics |
| `PUT` | `/api/profiles/{userId}/activate` | Activate a profile |
| `PUT` | `/api/profiles/{userId}/deactivate` | Deactivate a profile |

## Events

The User Service consumes the following Kafka events:

*   **Topic**: `user-registered-events`
    *   **Action**: Creates a new `UserProfile` entry with the user's ID and email.

## Database Schema

The `UserProfile` entity includes:
*   `userId` (UUID, unique)
*   `firstName`, `lastName`, `email`
*   `city`, `institution`
*   `profilePictureUrl`
*   `profileCompleted` (Boolean)
*   `isActive` (Boolean)
