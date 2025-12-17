### **Project Summary: Online Examination & Results Management System (OERMS)**

This project is a comprehensive, microservices-based platform designed to manage the entire lifecycle of online examinations.
 The system follows a modern, distributed architecture where each service has a distinct and well-defined responsibility, allowing for independent development, deployment, and scaling.

Here is a breakdown of the completed services and their roles:

*   **`auth-service`**: The gateway to the entire system. It handles user authentication (verifying identity) and authorization (granting permissions). It is responsible for issuing security tokens (likely JWTs) that are used to secure communication between the user and the other microservices.

*   **`user-service`**: Manages all user-related data. This includes profiles for different roles like students, teachers,
 and administrators. It handles user registration, profile updates, and retrieval of user information.

*   **`question-service`**: Acts as the central "question bank." This service is responsible for creating, storing, updating, and retrieving individual questions, along with their associated options, correct answers, and metadata (like marks or
 difficulty).

*   **`exam-service`**: Orchestrates the creation and management of exams. It allows teachers to define an exam, assemble questions from the `question-service`, and set rules such as duration, total marks, start/end times, and passing criteria.

*   **`attempt-service`**:
 Manages the active state of a student taking an exam. When a student starts an exam, this service creates an "attempt" record. It is responsible for saving the student's answers in real-time, tracking the time spent, and handling the final submission.

*   **`result-service`**: Responsible
 for processing submitted exam attempts. It calculates scores, determines pass/fail status, generates detailed results, and stores them for future access by both students and teachers.

### **Awaiting Implementation: `notification-service`**

The **`notification-service`** is the planned next step to enhance user engagement and
 communication. Its primary role will be to send timely notifications to users based on events occurring within the system.

**How it will be utilized:**

This service will likely operate asynchronously by subscribing to events published by the other services. For example:

*   When the `exam-service` publishes a new exam,
 the `notification-service` could alert all enrolled students.
*   Upon successful submission of an exam to the `attempt-service`, it could send a confirmation email or push notification to the student.
*   When the `result-service` finishes grading an attempt, it could notify the student that their results
 are available.
*   It could also be used for sending reminders about upcoming exam deadlines or system announcements.

By decoupling notification logic from the core services, the system remains clean, and you can easily add new notification channels (e.g., Email, SMS, WebSockets) in the future without modifying the other parts
 of the application.