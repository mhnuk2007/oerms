package com.oerms.exam.enums;

public enum ExamEventType {
    EXAM_CREATED("exam.created"),
    EXAM_UPDATED("exam.updated"),
    EXAM_DELETED("exam.deleted"),
    EXAM_PUBLISHED("exam.published"),
    EXAM_UNPUBLISHED("exam.unpublished"),
    EXAM_ARCHIVED("exam.archived"),
    EXAM_STARTED("exam.started"),
    EXAM_COMPLETED("exam.completed"),
    EXAM_CANCELLED("exam.cancelled"),
    EXAM_SCHEDULED("exam.scheduled"),
    EXAM_REMINDER("exam.reminder");

    private final String value;

    ExamEventType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}