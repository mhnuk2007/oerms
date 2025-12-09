package com.oerms.common.enums;

/**
 * User roles in the system
 */
public enum Role {
    STUDENT("Student - Can take exams and view results"),
    TEACHER("Teacher - Can create exams and questions"),
    ADMIN("Admin - Full system access");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public String getRoleWithPrefix() {
        return "ROLE_" + this.name();
    }
}