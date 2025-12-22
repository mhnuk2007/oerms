package com.oerms.attempt.dto;

import com.oerms.attempt.enums.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultResponse {
    private UUID attemptId;
    private UUID examId;
    private String examTitle;
    private UUID studentId;
    private String studentName;
    private AttemptStatus status;
    private Integer totalMarks;
    private Double obtainedMarks;
    private Double percentage;
    private Boolean passed;
    private String grade;
    private String resultStatus;
    private LocalDateTime publishedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenSeconds;
    private List<AttemptResultDetailDTO> details;
}
