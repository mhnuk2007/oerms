package com.oerms.common.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResponse {
    private UUID id;
    private UUID examId;
    private String examTitle;
    private UUID studentId;
    private String studentName;
    private Integer attemptNumber;
    private String status;
    private Integer totalQuestions;
    private Integer totalMarks;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer examDurationInMinutes;
    private Long timeTakenSeconds;
    private Integer tabSwitches;
    private Integer webcamViolations;
    private Boolean autoSubmitted;
}
