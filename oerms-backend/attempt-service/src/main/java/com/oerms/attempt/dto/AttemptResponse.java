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
public class AttemptResponse {

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
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private Integer examDurationInMinutes;
    private Integer tabSwitches;
    private Integer webcamViolations;
    private Boolean autoSubmitted;
    private String notes;
    private List<AttemptAnswerResponse> answers;
}
