package com.oerms.common.enums;

/**
 * Status of exam attempt
 */
public enum AttemptStatus {
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    SUBMITTED("Submitted"),
    AUTO_SUBMITTED("Auto Submitted"),
    COMPLETED("Completed"),
    EXPIRED("Expired - Time ran out"),
    EVALUATED("Evaluated");

    private final String description;

    AttemptStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
