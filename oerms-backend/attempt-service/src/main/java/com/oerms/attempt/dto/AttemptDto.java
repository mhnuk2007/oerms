package com.oerms.attempt.dto;

import com.oerms.common.enums.AttemptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
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
    private Integer totalMarks;
    private Integer answeredQuestions;
    private Integer flaggedQuestions;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private Integer remainingTimeSeconds;
    private Integer examDurationInMinutes;

    private Integer tabSwitches;
    private Integer webcamViolations;
    private Integer copyPasteCount;
    private Boolean autoSubmitted;
    private Boolean reviewed;

    private String notes;

    private List<AttemptAnswerDTO> answers;
}
