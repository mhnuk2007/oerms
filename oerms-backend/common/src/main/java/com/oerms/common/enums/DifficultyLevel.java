package com.oerms.common.enums;

/**
 * Difficulty levels for exams and questions
 */
public enum DifficultyLevel {
    EASY("Easy"),
    MEDIUM("Medium"),
    HARD("Hard"),
    EXPERT("Expert");

    private final String description;

    DifficultyLevel(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}