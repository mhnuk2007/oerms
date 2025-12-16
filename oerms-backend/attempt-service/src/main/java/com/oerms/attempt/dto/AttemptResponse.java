package com.oerms.attempt.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.oerms.attempt.enums.AttemptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
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
    private Double obtainedMarks;
    private Double percentage;
    private Boolean passed;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime startedAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private Integer remainingTimeSeconds;

    private Integer tabSwitches;
    private Integer webcamViolations;
    private Boolean autoSubmitted;
    private Boolean reviewed;

    private String notes;

    private List<AttemptAnswerResponse> answers;
}
