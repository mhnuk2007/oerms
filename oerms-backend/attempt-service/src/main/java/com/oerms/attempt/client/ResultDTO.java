package com.oerms.attempt.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    private Boolean passed;
    private String grade;
    private String status;
    private Integer totalQuestions;
    private Long timeTakenSeconds;
    private LocalDateTime submittedAt;
    private LocalDateTime publishedAt;
    private Boolean autoGraded;
    private Boolean requiresManualGrading;
    private Integer tabSwitches;
    private Integer webcamViolations;
}
