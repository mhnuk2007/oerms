# System Registry (Eureka Server)

The **System Registry** is the Service Discovery server for the OERMS (Online Exam & Result Management System) microservices architecture. It uses **Netflix Eureka** to allow microservices to register themselves and discover other services dynamically without hardcoded URLs.

## Features

*   **Service Registration**: Microservices (Auth, User, Exam, etc.) register themselves with this server upon startup.
*   **Service Discovery**: Clients (like the API Gateway) query this registry to find the location (IP and port) of available service instances.
*   **Health Monitoring**: Tracks the heartbeat of registered services and removes unhealthy instances.

## Tech Stack

*   **Java 17**
*   **Spring Boot 3.x**
*   **Spring Cloud Netflix Eureka Server**

## Prerequisites

This is a foundational service. It should be one of the first services to start, as other services depend on it to register.

## Configuration

The service is configured via `src/main/resources/application.yml`. Key configurations include:

*   **Server Port**: `8761` (Default Eureka port)
*   **Application Name**: `service-registry`
*   **Self-Preservation**: Disabled (`enable-self-preservation: false`) for development environments to allow quick removal of down services.
*   **Eviction Interval**: `10000` ms (10 seconds) - checks for expired leases frequently.

## Running the Application

You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

Or build the JAR and run it:

```bash
./mvnw clean package
java -jar target/system-registry-1.0.0.jar
```

## Dashboard

Once running, you can access the Eureka Dashboard to view registered services:

*   **URL**: [http://localhost:8761](http://localhost:8761)

The dashboard displays:
*   System status
*   Currently registered instances (e.g., `API-GATEWAY`, `AUTH-SERVER`, `USER-SERVICE`)
*   General info (environment, memory usage)

## Usage in Microservices

Other microservices connect to this registry using the following configuration in their `application.yml`:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```
