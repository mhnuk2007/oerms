# OERMS Architecture Summary: Auth Service & User Service

This document provides a high-level summary of the `auth-server` and `user-service`, explaining their roles and how they interact within the OERMS microservices architecture.

---

## Core Architectural Pattern: CQRS

The user management system is designed using the **Command Query Responsibility Segregation (CQRS)** pattern. This means that the responsibility for writing data (Commands) is separated from the responsibility for reading data (Queries).

-   **Commands (Writes):** Handled exclusively by the `auth-server`.
-   **Queries (Reads):** Handled primarily by the `user-service`.

This separation allows each service to be optimized for its specific task, leading to better performance, scalability, and resilience.

---

### 1. `auth-server`: The Master & Gatekeeper

The `auth-server` is the **single source of truth** for all user data and authentication.

#### Key Responsibilities:

-   **OAuth2 Authorization Server:**
    -   Manages user login and authentication.
    -   Issues JWT (JSON Web Tokens) to authenticated users, which are required to access other services.
    -   Handles token refreshing and validation.

-   **Master User Database (The "Write" Service):**
    -   Owns the `oerms_auth` PostgreSQL database.
    -   It is the **only** service authorized to perform write operations on user data (create, update, delete).
    -   Provides secure endpoints for user registration (`/auth/register`) and user management (`/users/**`).

-   **Event Publisher:**
    -   When user data changes (e.g., a new user registers or a profile is updated), it publishes a `UserEvent` message to a Kafka topic (`user-events`).
    -   This event-driven approach decouples it from other services, allowing them to react to changes asynchronously.

**In short: The `auth-server` is the system's central authority. It controls who gets in and is the definitive record-keeper for all user data.**

---

### 2. `user-service`: The High-Speed Read Replica

The `user-service` is a **read-optimized replica** of user data, designed for high performance and scalability.

#### Key Responsibilities:

-   **Fast User Profile Reads (The "Query" Service):**
    -   Its primary mission is to provide fast, scalable read access to user profiles for other microservices (e.g., `exam-service`, `question-service`).
    -   It exposes endpoints like `/api/users/profile/{userId}` for this purpose.

-   **Data Synchronization (Kafka Consumer):**
    -   It subscribes to the `user-events` Kafka topic.
    -   When it receives a `UserEvent` from the `auth-server`, it updates its own local database (`oerms_user`) to stay in sync. This process is known as **eventual consistency**.

-   **Performance Caching (Redis):**
    -   It uses a Redis cache to store frequently accessed user profiles.
    -   When a user profile is requested, it first checks Redis. If the data is present (a cache hit), it returns it instantly without querying its database, dramatically improving response times.

**In short: The `user-service` is a specialized, high-performance library for user data. It's designed to answer the question "Who is this user?" as quickly and reliably as possible.**

---

### How They Work Together: End-to-End Flow

1.  **Registration (Write Path):**
    -   A user registers via the API Gateway.
    -   The request is routed to the **`auth-server`**.
    -   The `auth-server` saves the new user to its master database and publishes a `user.created` event to Kafka.
    -   The **`user-service`** consumes this event and creates a synchronized copy of the user in its own database.

2.  **Profile Viewing (Read Path):**
    -   Another service (e.g., `exam-service`) needs to display a user's name.
    -   It makes a request to the **`user-service`**.
    -   The `user-service` fetches the data from its Redis cache (or its local database if not cached) and returns it quickly.

This architecture ensures that the high volume of read requests does not impact the critical write and authentication operations of the `auth-server`, creating a robust and scalable system.
