package com.oerms.common.enums;

/**
 * Types of notifications
 */
public enum NotificationType {
    EMAIL("Email Notification"),
    SMS("SMS Notification"),
    PUSH("Push Notification"),
    IN_APP("In-App Notification");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}