package com.oerms.attempt.dto;

import com.oerms.common.enums.AttemptStatus;
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
public class AttemptDto {
    private UUID id;
    private UUID examId;
    private String examTitle;
    private UUID studentId;
    private String studentName;
    private Integer attemptNumber;
    private AttemptStatus status;
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private Integer flaggedQuestions;
    private Integer totalMarks;
    private Double obtainedMarks;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private Integer remainingTimeSeconds;
    private Boolean passed;
}