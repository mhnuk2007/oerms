package com.oerms.common.enums;

public enum ExamStatus {
    DRAFT("Draft - Exam is being created"),
    PUBLISHED("Published - Available for students"),
    SCHEDULED("Scheduled - Will start at specified time"),
    ONGOING("Ongoing - Currently in progress"),
    COMPLETED("Completed - Exam has ended"),
    CANCELLED("Cancelled - Exam was cancelled"),
    ARCHIVED("Archived - No longer active");

    private final String description;

    ExamStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if exam is in a modifiable state
     */
    public boolean isModifiable() {
        return this == DRAFT;
    }

    /**
     * Check if exam is active for students
     */
    public boolean isActiveForStudents() {
        return this == PUBLISHED || this == SCHEDULED || this == ONGOING;
    }

    /**
     * Check if exam is in a terminal state (cannot be changed)
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == ARCHIVED;
    }

    /**
     * Check if exam can be taken by students
     */
    public boolean isAvailableForAttempt() {
        return this == PUBLISHED || this == ONGOING;
    }
}