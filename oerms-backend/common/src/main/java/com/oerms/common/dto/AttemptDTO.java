package com.oerms.common.dto;

import com.oerms.common.enums.AttemptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptDTO {

    // =========================
    // Identity
    // =========================
    private UUID id;
    private UUID examId;
    private String examTitle;

    private UUID studentId;
    private String studentName;
    private Integer attemptNumber;

    // =========================
    // Status & Timing
    // =========================
    private AttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private Boolean autoSubmitted;

    // =========================
    // Evaluation
    // =========================
    private Integer totalMarks;
    private Double obtainedMarks;
    private Double percentage;
    private Boolean passed;
    private Integer totalQuestions;

    // =========================
    // Proctoring / Monitoring
    // =========================
    private Integer tabSwitches;
    private Integer webcamViolations;

    // =========================
    // Answers (used ONLY inside result-service)
    // =========================
    private List<AttemptAnswerDTO> answers;

    // =========================
    // Optional
    // =========================
    private String notes;
}
