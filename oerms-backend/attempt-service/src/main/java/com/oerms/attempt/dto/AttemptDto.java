package com.oerms.attempt.dto;

import com.oerms.attempt.enums.AttemptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptDto {

    // ---------- Identity ----------
    private UUID id;
    private UUID examId;
    private String examTitle;

    private UUID studentId;
    private String studentName;
    private Integer attemptNumber;

    // ---------- Status ----------
    private AttemptStatus status;

    // ---------- Progress ----------
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private Integer flaggedQuestions;

    // ---------- Scoring ----------
    private Integer totalMarks;
    private Double obtainedMarks;
    private Double percentage;
    private Boolean passed;

    // ---------- Timing ----------
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private Integer remainingTimeSeconds;
    private Integer examDurationInMinutes;

    // ---------- Proctoring ----------
    private Integer tabSwitches;
    private Integer webcamViolations;
    private Integer copyPasteCount;
    private Boolean autoSubmitted;
    private Boolean reviewed;

    // ---------- Metadata ----------
    private String notes;

    // ---------- Answers ----------
    private List<AttemptAnswerDTO> answers;
}
