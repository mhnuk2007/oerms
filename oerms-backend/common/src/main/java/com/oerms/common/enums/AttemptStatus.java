package com.oerms.common.enums;

public enum AttemptStatus {
    IN_PROGRESS,
    PAUSED,
    SUBMITTED,
    AUTO_SUBMITTED,
    ABANDONED,
    COMPLETED,
    CANCELLED;
    
    public boolean isFinalState() {
        return this == SUBMITTED || this == AUTO_SUBMITTED || 
               this == ABANDONED || this == CANCELLED;
    }
    
    public boolean canBeSubmitted() {
        return this == IN_PROGRESS || this == PAUSED;
    }
}
