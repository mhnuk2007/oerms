package com.oerms.attempt.enums;

public enum AttemptStatus {
    IN_PROGRESS,     // Exam is being taken
    SUBMITTED,       // Student submitted manually
    AUTO_SUBMITTED,  // Auto-submitted due to time expiry
    UNDER_REVIEW,    // Being reviewed/graded
    COMPLETED,       // Grading completed
    GRADED,         // same as completed
    ABANDONED        // Student left without submitting
}