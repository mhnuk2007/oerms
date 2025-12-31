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
public class UpdateExamRequest {
    
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer duration;
    
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;
    
    @Min(value = 0, message = "Passing marks must be non-negative")
    private Integer passingMarks;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private Boolean allowMultipleAttempts;
    
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;
    
    private Boolean shuffleQuestions;
    
    private Boolean shuffleOptions;
    
    private Boolean showResultsImmediately;
    
    private Boolean allowReview;
    
    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;
    
    private List<UUID> prerequisiteExamIds;
    
    private Boolean negativeMarking;
    
    @DecimalMin(value = "0.0", message = "Negative marks must be non-negative")
    private Double negativeMarksPerQuestion;
    
    private Boolean autoSubmit;
    
    private Boolean webcamRequired;
    
    private Boolean fullScreenRequired;
    
    private Boolean randomizeQuestionOrder;
    
    private Boolean showQuestionNumbers;
    
    private Boolean allowQuestionNavigation;
    
    private Boolean certificateEnabled;
    
    private UUID certificateTemplateId;
}