package com.oerms.common.enums;

/**
 * Types of questions supported
 */
public enum QuestionType {
    MCQ("Multiple Choice Question"),
    TRUE_FALSE("True/False Question"),
    SHORT_ANSWER("Short Answer Question"),
    ESSAY("Essay Question");

    private final String description;

    QuestionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isAutoGradable() {
        return this == MCQ || this == TRUE_FALSE;
    }
}