package com.oerms.attempt.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO containing statistics about questions in an exam
 * Used by both question-service and exam-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionStatisticsDTO {
    // Total counts
    private Long totalQuestions;
    private Integer totalMarks;
    
    // By question type
    private Long mcqCount;
    private Long multipleSelectCount;
    private Long trueFalseCount;
    private Long shortAnswerCount;
    private Long essayCount;
    
    // By difficulty level
    private Long easyCount;
    private Long mediumCount;
    private Long hardCount;
    
    // Additional metrics
    private Double averageMarksPerQuestion;
    private Integer highestMarks;
    private Integer lowestMarks;
}