# Auth Server

The **Auth Server** is the centralized Identity and Access Management (IAM) service for the OERMS (Online Exam & Result Management System). It handles user authentication, authorization, and token issuance using **OAuth 2.1** and **OpenID Connect (OIDC)**.

## Features

*   **OAuth2 Authorization Server**: Issues JWT access tokens and refresh tokens.
*   **User Management**: Registration, login, and role-based access control (RBAC).
*   **Admin User Management**: Admin APIs to search, enable/disable, lock/unlock, and delete users.
*   **Single Sign-On (SSO)**: Provides a unified login experience for the platform.
*   **Event Driven**: Publishes user registration events to Kafka for other services (e.g., User Service) to consume.
*   **Caching**: Uses Redis to cache user details and tokens for performance.
*   **Database Migration**: Uses Flyway for versioned database schema management.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Authorization Server** (OAuth 2.1)
*   **Spring Security**
*   **PostgreSQL** (Primary Database)
*   **Redis** (Caching)
*   **Apache Kafka** (Event Streaming)
*   **Flyway** (Database Migration)
*   **Spring Cloud Netflix Eureka Client**

## Prerequisites

Before running the Auth Server, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **PostgreSQL**: Database `oerms_auth` must exist.
3.  **Redis**: Running on port `6379`.
4.  **Kafka**: Running on port `9092`.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `9000`
*   **Database**: `jdbc:postgresql://localhost:5432/oerms_auth`
*   **Redis**: `localhost:6379`
*   **Kafka**: `localhost:9092`
*   **Gateway URL**: `http://localhost:8080`

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/auth-server-1.0.0.jar
```

## API Documentation

The API documentation is available via Swagger UI:

*   **Swagger UI**: [http://localhost:9000/swagger-ui.html](http://localhost:9000/swagger-ui.html)
*   **OpenAPI JSON**: [http://localhost:9000/v3/api-docs](http://localhost:9000/v3/api-docs)

## Key Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `GET` | `/api/auth/me` | Get current authenticated user details |
| `GET` | `/oauth2/authorize` | OAuth2 Authorization Endpoint |
| `POST` | `/oauth2/token` | OAuth2 Token Endpoint |
| `GET` | `/.well-known/openid-configuration` | OIDC Discovery Endpoint |

### Admin User Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Get all users (paginated) |
| `GET` | `/api/admin/users/search` | Search users by username/email |
| `GET` | `/api/admin/users/{id}` | Get user by ID |
| `PUT` | `/api/admin/users/{id}/enable` | Enable user account |
| `PUT` | `/api/admin/users/{id}/disable` | Disable user account |
| `PUT` | `/api/admin/users/{id}/lock` | Lock user account |
| `PUT` | `/api/admin/users/{id}/unlock` | Unlock user account |
| `DELETE` | `/api/admin/users/{id}` | Delete user |

## Events

The Auth Server publishes the following Kafka events:

*   **Topic**: `user-registered-events`
    *   **Trigger**: When a new user successfully registers.
    *   **Payload**: Contains user ID, email, and basic info.
    *   **Consumer**: User Service (creates a profile).

## Security Roles

*   `ROLE_STUDENT`: Standard user access.
*   `ROLE_TEACHER`: Access to create exams and questions.
*   `ROLE_ADMIN`: Full system access.

## Database Schema

The `User` entity includes:
*   `userName`, `email`, `password`
*   `enabled`, `accountNonExpired`, `accountNonLocked`, `credentialsNonExpired`
*   `roles` (Set of Enums)
*   `lastLogin` timestamp
