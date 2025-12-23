# OERMS Refactoring Plan: Decoupling Attempt & Result Services

## 1. Executive Summary
**Objective:** Strictly separate the concerns of **Exam Execution** (Write-heavy, High Availability) from **Exam Reporting** (Read-heavy, Analytical).

**Current State:** `attempt-service` handles both taking the exam and generating detailed reports (including grading logic), leading to tight coupling and security risks (accessing answer keys).

**Target State:**
*   `attempt-service`: Manages the lifecycle of an attempt (Start -> Answer -> Submit).
*   `result-service`: Manages the evaluation, grading, and detailed reporting.

---

## 2. Architecture Changes

### Data Flow: "View Result Details"
**Old Flow:**
Client -> `AttemptService` -> (Internal Call to QuestionService for Keys) -> Aggregate -> Client

**New Flow:**
Client -> `ResultService` -> (Fetch Result Entity)
-> (Parallel Call to `AttemptService` for Student Answers)
-> (Parallel Call to `QuestionService` for Answer Keys)
-> Aggregate & Mask Keys -> Client

---

## 3. Detailed Service Changes

### A. Attempt Service (`attempt-service`)
**Goal:** Remove all grading and reporting logic. Focus solely on capturing student input.

1.  **Controller Layer (`AttemptController.java`)**
    *   **REMOVE:** `GET /{attemptId}/result-details`
        *   *Reason:* Reporting logic belongs in Result Service.
    *   **REMOVE:** `GET /exam/{examId}/statistics`
        *   *Reason:* Aggregated scores/grades belong in Result Service.
    *   **KEEP:** `GET /{attemptId}/answers`
        *   *Action:* Ensure this endpoint is accessible via Feign Client (either by forwarding user token or allowing internal service account access).

2.  **Service Layer (`AttemptService.java`)**
    *   **REMOVE:** `getAttemptResultDetails(...)` logic.
    *   **REMOVE:** Any dependency on `QuestionService` that fetches "Correct Answers".
    *   **MODIFY:** `submitAttempt(...)` should strictly return the submission status. It should **not** return the calculated score immediately if that requires synchronous grading. It should publish an event (e.g., `AttemptSubmittedEvent`) or rely on the client to poll `result-service`.

3.  **Security**
    *   Revoke `attempt-service`'s privileges to access "Answer Keys" from `question-service`.

### B. Result Service (`result-service`)
**Goal:** Centralize all evaluation and reporting logic.

1.  **Controller Layer (`ResultController.java`)**
    *   **ADD:** `GET /results/{resultId}/details`
        *   *Input:* `resultId` (UUID)
        *   *Output:* `ResultDetailsResponse` (Score, Grade, List of Questions with Student Answer vs Correct Answer).
    *   **ADD:** `GET /results/exam/{examId}/statistics`
        *   *Logic:* Fetch all results for exam -> Calculate Avg/Max/Min.

2.  **Service Layer (`ResultServiceImpl.java`)**
    *   **Implement Aggregation Logic:**
        1.  Fetch `Result` entity (DB).
        2.  Call `AttemptClient.getAttemptAnswers(attemptId)`.
        3.  Call `QuestionClient.getQuestionsWithKeys(examId)`.
        4.  Map & Combine data.

3.  **Infrastructure (Feign Clients)**
    *   **ADD:** `AttemptClient`
        *   Target: `attempt-service`
        *   Method: `getAttemptAnswers(UUID attemptId)`
    *   **ADD:** `QuestionClient`
        *   Target: `question-service`
        *   Method: `getQuestionsForGrading(UUID examId)` (Secured/Internal).

### C. Question Service (`question-service`)
**Goal:** Provide data to Result Service securely.

1.  **API**
    *   Ensure an endpoint exists (e.g., `/internal/questions/batch`) that accepts a list of IDs or an Exam ID and returns full question details (including `correctOption`, `explanation`).
    *   **Security:** This endpoint must be restricted to internal services (Result Service) only.

---

## 4. Migration Strategy

1.  **Phase 1: Build Result Service Logic**
    *   Implement the `ResultDetails` endpoint in `result-service`.
    *   Verify it can fetch data from `attempt-service` and `question-service`.

2.  **Phase 2: Frontend Switch**
    *   Update the UI "View Result" button to point to `result-service` (`/api/results/{id}/details`) instead of `attempt-service`.

3.  **Phase 3: Cleanup**
    *   Delete the deprecated endpoints from `attempt-service`.
    *   Remove unused Feign clients and configs from `attempt-service`.

---

## 5. Verification & Remaining Gaps
Upon deep review, the following implementation details must be addressed to ensure system stability:

1.  **Async Grading Trigger (Critical):**
    *   The plan mentions `AttemptService` publishing an event.
    *   **Action:** `result-service` must implement a listener (e.g., `@KafkaListener` or `@RabbitListener`) for `AttemptSubmittedEvent`. This listener triggers the grading logic (fetching answers, fetching keys, calculating score, saving Result).
    *   *Gap:* Without this, results will never be generated.

2.  **Resilience (Circuit Breakers):**
    *   The `ResultDetails` endpoint depends on two other services.
    *   **Action:** Implement Resilience4j circuit breakers on `AttemptClient` and `QuestionClient`.
    *   *Fallback:* If `attempt-service` is down, return the Score but with a "Details currently unavailable" message.

3.  **Internal Security:**
    *   The internal endpoints (`/internal/questions/...` and `/attempts/{id}/answers`) need protection.
    *   **Action:** Implement an Inter-Service Authentication mechanism (e.g., passing a shared secret header or using Client Credentials Flow).
---