package com.oerms.common.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateExamRequest {

    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer duration;

    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;

    @Min(value = 0, message = "Passing marks cannot be negative")
    private Integer passingMarks;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Boolean allowMultipleAttempts;

    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;

    private Boolean shuffleQuestions;
    private Boolean showResultsImmediately;

    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;
}
