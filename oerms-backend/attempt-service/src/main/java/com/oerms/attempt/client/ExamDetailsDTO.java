package com.oerms.attempt.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO that maps to ExamDTO from exam-service
 * This should match the structure returned by exam-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDetailsDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID teacherId;
    private String teacherName;
    private Integer duration; // in minutes
    private Integer totalMarks;
    private Integer passingMarks;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Changed from Boolean to String to match exam-service
    private String status; // DRAFT, PUBLISHED, ARCHIVED, CANCELLED
    
    private Boolean isActive;
    private Boolean allowMultipleAttempts;
    private Integer maxAttempts;
    private Boolean shuffleQuestions;
    private Boolean showResultsImmediately;
    private String instructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Helper method to check if exam is published
     * Checks the status enum value
     */
    public Boolean getIsPublished() {
        return "PUBLISHED".equals(status);
    }
    
    /**
     * Helper method to check if exam is active
     * An exam is considered active if status is PUBLISHED and isActive is true
     */
    public Boolean isAvailableForAttempt() {
        return getIsPublished() && Boolean.TRUE.equals(isActive);
    }
    
    /**
     * Helper method to check if exam has started
     */
    public Boolean hasStarted() {
        if (startTime == null) {
            return true; // No start time means it's always started
        }
        return LocalDateTime.now().isAfter(startTime) || 
               LocalDateTime.now().isEqual(startTime);
    }
    
    /**
     * Helper method to check if exam has ended
     */
    public Boolean hasEnded() {
        if (endTime == null) {
            return false; // No end time means it never ends
        }
        return LocalDateTime.now().isAfter(endTime);
    }
}