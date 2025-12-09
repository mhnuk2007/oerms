package com.oerms.result.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.oerms.result.enums.ResultStatus;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResultDTO {
    private UUID id;
    private UUID attemptId;
    private UUID examId;
    private String examTitle;
    private UUID studentId;
    private String studentName;
    private Integer totalMarks;
    private Double obtainedMarks;
    private Double percentage;
    private Integer passingMarks;
    private Boolean passed;
    private String grade;
    private Integer rank;
    private ResultStatus status;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer unanswered;
    private Integer timeTakenSeconds;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
    private UUID gradedBy;
    private String gradedByName;
    private LocalDateTime publishedAt;
    private String teacherFeedback;
    private String teacherRemarks;
    private Boolean autoGraded;
    private Boolean requiresManualGrading;
    private Double objectiveMarks;
    private Double subjectiveMarks;
    private Integer tabSwitches;
    private Integer webcamViolations;
    private Boolean suspiciousActivity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
