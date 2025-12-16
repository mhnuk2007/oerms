package com.oerms.exam.enums;

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

    public boolean isModifiable() {
        return this == DRAFT;
    }

    public boolean isActiveForStudents() {
        return this == PUBLISHED || this == SCHEDULED || this == ONGOING;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == ARCHIVED;
    }

    public boolean isAvailableForAttempt() {
        return this == PUBLISHED || this == ONGOING;
    }
}