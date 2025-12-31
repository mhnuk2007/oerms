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
    private UUID studentId;
    private String studentName;
    private Integer attemptNumber;
    private AttemptStatus status;
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Long timeTakenSeconds;
    private Boolean suspicious;
}
