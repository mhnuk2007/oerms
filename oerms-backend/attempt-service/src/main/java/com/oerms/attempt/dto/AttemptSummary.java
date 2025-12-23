package com.oerms.attempt.dto;

import com.oerms.common.enums.AttemptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptSummary {

    private UUID id;
    private UUID examId;
    private String examTitle;
    private Integer attemptNumber;
    private AttemptStatus status;
    private Integer answeredQuestions;
    private Integer totalQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
