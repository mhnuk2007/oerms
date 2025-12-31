package com.oerms.common.enums;

public enum ExamStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED,
    CANCELLED,
    COMPLETED;
    
    public boolean isAvailableForAttempt() {
        return this == PUBLISHED;
    }
}
