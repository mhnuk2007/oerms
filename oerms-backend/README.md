# OERMS - Online Exam & Result Management System

OERMS is a comprehensive, microservices-based platform designed to manage the entire lifecycle of online examinations, from user registration and exam creation to attempt submission and result analytics.

## System Architecture

The system is built on a microservices architecture, with each service handling a specific business domain. Key architectural components include:

*   **Service Registry (Eureka)**: Allows services to dynamically discover and communicate with each other.
*   **API Gateway (Spring Cloud Gateway)**: Acts as the single entry point for all client requests, handling routing, security, and cross-cutting concerns.
*   **Authorization Server (OAuth2)**: Centralized identity and access management for securing the entire platform.
*   **Event-Driven Communication (Kafka)**: Services communicate asynchronously using Kafka events for better decoupling and resilience (e.g., user registration, attempt submission).
*   **Centralized Configuration**: (Future enhancement) Use Spring Cloud Config for managing external configurations.

```
+----------------+      +-----------------+      +-----------------+
|   Web Client   |----->|   API Gateway   |----->| Service Registry|
+----------------+      +-------+---------+      +-----------------+
                                |
                                | Routes to...
                                |
          +---------------------+---------------------+
          |                     |                     |
+---------v-------+   +---------v-------+   +---------v-------+
|   Auth Server   |   |   User Service  |   |   Exam Service  |
+-----------------+   +-----------------+   +-----------------+
          |                     |                     |
          | (UserRegistered)    | (ExamPublished)     | (AttemptStarted)
          |                     |                     |
          +---------------------v---------------------+
                              |
                      +-------v--------+
                      |  Apache Kafka  |
                      +-------^--------+
                              |
          +---------------------+---------------------+---------------------+
          |                     |                     |                     |
+---------v---------+ +---------v---------+ +---------v---------+ +---------v-------------+
| Question Service  | |  Attempt Service  | |  Result Service   | | Notification Service|
+-------------------+ +-------------------+ +-------------------+ +---------------------+

```

## Modules / Microservices

| Service | Port | Description |
| :--- | :--- | :--- |
| **`system-registry`** | `8761` | Eureka server for service discovery. |
| **`api-gateway`** | `8080` | Routes external requests to internal services and handles security. |
| **`auth-server`** | `9000` | Manages users, roles, authentication, and authorization (OAuth2). |
| **`user-service`** | `9001` | Manages user profiles and related data. |
| **`exam-service`** | `9002` | Manages the lifecycle of exams (creation, scheduling, publishing). |
| **`question-service`**| `9003` | Manages the question bank for all exams. |
| **`attempt-service`** | `9004` | Manages student attempts, including saving answers and proctoring. |
| **`result-service`** | `9005` | Grades attempts, generates results, and provides analytics. |
| **`notification-service`**|`9006`| Handles all user notifications (Email, WebSocket, etc.). |
| **`common`** | - | A shared library with common DTOs, Enums, Events, and Exceptions. |

## Core Technologies

*   **Backend**: Java 17, Spring Boot 3, Spring Cloud
*   **Database**: PostgreSQL
*   **Caching**: Redis
*   **Messaging**: Apache Kafka
*   **Security**: Spring Security, OAuth 2.1, JWT
*   **Service Discovery**: Netflix Eureka
*   **API Gateway**: Spring Cloud Gateway
*   **Build Tool**: Apache Maven

## Prerequisites

*   **JDK 17** or later
*   **Apache Maven** 3.8+
*   **Docker** and **Docker Compose** (for running infrastructure)

## Getting Started

### 1. Run Infrastructure Services

The easiest way to run the required infrastructure (PostgreSQL, Redis, Kafka, Zookeeper) is by using Docker. A `docker-compose.yml` file should be present in the project root.

```bash
# Start all infrastructure containers in the background
docker-compose up -d
```

### 2. Build the Common Module

The `common` module must be built and installed into your local Maven repository so other services can use it.

```bash
# Navigate to the common module directory
cd common

# Clean and install the package
./mvnw clean install

# Navigate back to the root directory
cd ..
```

### 3. Run the Microservices

The services must be started in a specific order due to dependencies. Open a new terminal for each service.

**Order of Startup:**

1.  **System Registry**
    ```bash
    cd system-registry
    ./mvnw spring-boot:run
    ```
    *Wait until the registry is running on `http://localhost:8761`.*

2.  **Auth Server**
    ```bash
    cd auth-server
    ./mvnw spring-boot:run
    ```

3.  **API Gateway**
    ```bash
    cd api-gateway
    ./mvnw spring-boot:run
    ```

4.  **Other Services** (can be started in any order)
    ```bash
    # User Service
    cd user-service
    ./mvnw spring-boot:run

    # Exam Service
    cd exam-service
    ./mvnw spring-boot:run

    # Question Service
    cd question-service
    ./mvnw spring-boot:run

    # Attempt Service
    cd attempt-service
    ./mvnw spring-boot:run

    # Result Service
    cd result-service
    ./mvnw spring-boot:run
    
    # Notification Service
    cd notification-service
    ./mvnw spring-boot:run
    ```

## API Documentation

Once all services are running, the aggregated API documentation for the entire system is available through the API Gateway:

*   **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

You can select the desired service from the dropdown menu in the top right corner to view its specific endpoints.
