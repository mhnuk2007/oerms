package com.oerms.exam.dto;

import com.oerms.exam.enums.ExamStatus;
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
public class ExamDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID teacherId;
    private String teacherName;
    private String subject;
    private Integer duration;
    private Integer totalMarks;
    private Integer passingMarks;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ExamStatus status;
    private Boolean isActive;
    private Boolean allowMultipleAttempts;
    private Integer maxAttempts;
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;
    private Boolean showResultsImmediately;
    private Boolean allowReview;
    private String instructions;
    
    // Template fields
    private Boolean isTemplate;
    private String templateName;
    private String templateDescription;
    
    // Prerequisites
    private List<UUID> prerequisiteExamIds;
    
    // Additional settings
    private Boolean negativeMarking;
    private Double negativeMarksPerQuestion;
    private Boolean autoSubmit;
    private Boolean webcamRequired;
    private Boolean fullScreenRequired;
    private Boolean randomizeQuestionOrder;
    private Boolean showQuestionNumbers;
    private Boolean allowQuestionNavigation;
    private Boolean certificateEnabled;
    private UUID certificateTemplateId;
    
    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
}
