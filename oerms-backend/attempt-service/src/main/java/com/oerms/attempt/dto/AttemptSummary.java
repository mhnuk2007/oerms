package com.oerms.attempt.dto;

import com.oerms.attempt.enums.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptSummary {
    private UUID id;
    private UUID examId;
    private String examTitle;
    private Integer attemptNumber;
    private AttemptStatus status;
    private Integer answeredQuestions;
    private Integer totalQuestions;
    private Double obtainedMarks;
    private Double percentage;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
