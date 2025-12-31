# Notification Service

## Overview
The **Notification Service** is a centralized microservice within the OERMS platform responsible for handling all user-facing notifications. It operates in an event-driven manner, consuming events from various Kafka topics to send timely and relevant notifications through multiple channels.

## Features
- **Multi-Channel Delivery**: Supports Email, In-App, and real-time WebSocket notifications. Includes a placeholder for SMS integration (e.g., Twilio).
- **Event-Driven Architecture**: Listens to Kafka topics for events like user registration, exam publishing, and result grading to trigger notifications automatically.
- **Template-Based Emails**: Uses Thymeleaf to generate rich, dynamic HTML emails from templates.
- **Real-time Notifications**: Pushes notifications to connected clients instantly using Spring WebSocket and STOMP.
- **Persistence & History**: Stores all in-app notifications in a PostgreSQL database, providing users with a notification history.
- **Scheduled Tasks**: Includes scheduled jobs for cleaning up old notifications and retrying failed email deliveries.
- **API & Management**: Provides REST endpoints for users to fetch, read, and manage their notifications.

## Tech Stack
- **Java 17** & **Spring Boot 3**
- **Spring Cloud**: Eureka Client, OpenFeign
- **Messaging**: Apache Kafka, Spring WebSocket (with STOMP)
- **Database**: PostgreSQL with Flyway for migrations
- **Email**: Spring Boot Mail with Thymeleaf for templating
- **API Documentation**: SpringDoc OpenAPI
- **Security**: Spring Security with OAuth2 Resource Server

## Prerequisites
- **JDK 17**
- **Apache Maven**
- **Docker** (for infrastructure)
- Running instances of:
    - Service Registry (Eureka)
    - Kafka & Zookeeper
    - PostgreSQL
    - Redis
    - Auth Server (for JWT validation)

## Running the Service
1.  Ensure all prerequisite infrastructure and services are running.
2.  Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```

## Configuration
Key settings in `application.yml`:
- **Port**: `9006` (Note: Port updated from 9005)
- **Database**: `jdbc:postgresql://localhost:5432/oerms_notification`
- **Kafka**: Connects to `localhost:9092` and consumes from various topics.
- **Email**: Configured for Gmail SMTP. Requires `MAIL_USERNAME` and `MAIL_PASSWORD` environment variables.

## API Documentation
API documentation is available via Swagger UI. The setup includes JWT Bearer authentication, allowing you to authorize requests directly from the UI.
- **Swagger UI**: [http://localhost:9006/swagger-ui.html](http://localhost:9006/swagger-ui.html)

## API Endpoints
- `GET /api/notifications/my`: Get all notifications for the authenticated user (paginated).
- `GET /api/notifications/my/unread`: Get only unread notifications.
- `GET /api/notifications/my/unread/count`: Get the count of unread notifications.
- `PUT /api/notifications/{id}/read`: Mark a specific notification as read.
- `PUT /api/notifications/my/read-all`: Mark all of the user's notifications as read.
- `DELETE /api/notifications/{id}`: Delete a notification.

## Event-Driven Flow
The service listens to the following Kafka topics to send notifications:
- `user-registered`: Welcomes a new user.
- `exam-events`: Notifies about exam creation, publishing, scheduling, etc.
- `attempt-submitted`: Informs a student that their exam attempt was received.
- `result-published`: Notifies a student that their exam result is available.
- `result-graded`: Informs a student that their exam has been manually graded.

## WebSocket Usage
- **Endpoint**: Connect your STOMP client to `ws://localhost:9006/ws`.
- **Subscription**: Subscribe to the user-specific queue at `/user/queue/notifications` to receive real-time updates.

## Database Schema
- **`notifications`**: Stores all in-app notifications, including their status (read/unread) and associated metadata.
- **`email_logs`**: Tracks the delivery status of every email sent by the service.
- **`notification_templates`**: Stores reusable templates for email, SMS, and in-app messages.
