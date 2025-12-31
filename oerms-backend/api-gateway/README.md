# API Gateway Service

The **API Gateway** is the entry point for the OERMS (Online Exam & Result Management System) backend microservices architecture. It routes requests to appropriate microservices, handles cross-cutting concerns like security, monitoring, and resiliency, and aggregates API documentation.

## Features

*   **Centralized Entry Point**: Routes API requests to backend services (Auth, User, Exam, Question, etc.).
*   **Service Discovery**: Integrates with Netflix Eureka to dynamically locate service instances.
*   **Security**: Acts as an OAuth2 Resource Server, validating JWT tokens before forwarding requests.
*   **Resiliency**: Implements Circuit Breakers using Resilience4j to handle downstream service failures gracefully.
*   **API Documentation**: Aggregates OpenAPI (Swagger) documentation from all microservices into a single UI.
*   **CORS Management**: Centralized Cross-Origin Resource Sharing configuration.
*   **Monitoring**: Exposes Actuator endpoints and Prometheus metrics.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Cloud Gateway** (WebFlux/Reactive)
*   **Spring Cloud Netflix Eureka Client**
*   **Spring Cloud Circuit Breaker (Resilience4j)**
*   **Spring Security (OAuth2 Resource Server)**
*   **SpringDoc OpenAPI**
*   **Redis** (for reactive support/rate limiting capabilities)

## Prerequisites

Before running the API Gateway, ensure the following services are running:

1.  **Service Registry (Eureka Server)**: Running on port `8761`.
2.  **Auth Server**: Running (default port `9000`) to provide JWT issuer services.
3.  **Redis**: Required if rate limiting or session management features are active.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `8080`
*   **Eureka Server URL**: `http://localhost:8761/eureka/`
*   **Auth Server Issuer URI**: `http://localhost:9000` (or via `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI`)
*   **Frontend URL**: `http://localhost:3000`

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/api-gateway-1.0.0.jar
```

## API Documentation

The API Gateway aggregates Swagger documentation from all registered services.

*   **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

You can switch between service definitions (e.g., Auth Server, Exam Service) using the dropdown in the Swagger UI.

## Routed Services

The gateway routes traffic to the following services based on the path:

| Service | Path Prefix | Description |
| :--- | :--- | :--- |
| **Auth Server** | `/api/auth/**`, `/oauth2/**` | Authentication & Authorization |
| **User Service** | `/api/profiles/**` | User profile management |
| **Exam Service** | `/api/exams/**` | Exam management |
| **Question Service** | `/api/questions/**` | Question bank management |
| **Attempt Service** | `/api/attempts/**` | Exam attempts |
| **Result Service** | `/api/results/**` | Exam results |
| **Notification Service** | `/api/notifications/**` | Notifications |

## Circuit Breakers

Circuit breakers are configured for all major routes. If a service is down or slow, the gateway will handle the failure according to the Resilience4j configuration (default: 50% failure rate threshold, 10s wait duration in open state).
