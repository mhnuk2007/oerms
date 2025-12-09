package com.oerms.result.enums;

public enum ResultStatus {
    DRAFT,              // Result created but not finalized
    PENDING_GRADING,    // Waiting for manual grading
    GRADED,             // Grading completed
    PUBLISHED,          // Published to student
    WITHHELD            // Result withheld (e.g., due to violations)
}