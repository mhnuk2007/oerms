package com.oerms.exam.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExamRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer duration;
    
    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;
    
    @Min(value = 0, message = "Passing marks must be non-negative")
    private Integer passingMarks;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    @Builder.Default
    private Boolean allowMultipleAttempts = false;
    
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;
    
    @Builder.Default
    private Boolean shuffleQuestions = false;
    
    @Builder.Default
    private Boolean shuffleOptions = false;
    
    @Builder.Default
    private Boolean showResultsImmediately = false;
    
    @Builder.Default
    private Boolean allowReview = true;
    
    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;
    
    private List<UUID> prerequisiteExamIds;
    
    @Builder.Default
    private Boolean negativeMarking = false;
    
    @DecimalMin(value = "0.0", message = "Negative marks must be non-negative")
    private Double negativeMarksPerQuestion;
    
    @Builder.Default
    private Boolean autoSubmit = true;
    
    @Builder.Default
    private Boolean webcamRequired = false;
    
    @Builder.Default
    private Boolean fullScreenRequired = false;
    
    @Builder.Default
    private Boolean randomizeQuestionOrder = false;
    
    @Builder.Default
    private Boolean showQuestionNumbers = true;
    
    @Builder.Default
    private Boolean allowQuestionNavigation = true;
    
    @Builder.Default
    private Boolean certificateEnabled = false;
    
    private UUID certificateTemplateId;
}