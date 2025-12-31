package com.oerms.result.dto;

import com.oerms.result.enums.ResultStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultDTO {
    private UUID id;
    private UUID attemptId;
    private UUID examId;
    private String examTitle;
    private UUID studentId;
    private String studentName;
    private Double obtainedMarks;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
    private Boolean passed;
    private Integer totalQuestions;
    private ResultStatus status;
    private Boolean requiresManualGrading;
    private Long timeTakenSeconds;
    private Integer attemptNumber;
    private Integer rank;
    private Integer tabSwitches;
    private Integer webcamViolations;
    private Boolean suspiciousActivity;
    private LocalDateTime submittedAt;
    private LocalDateTime publishedAt;
    private UUID publishedBy;
    private UUID gradedBy;
    private String gradedByName;
    private LocalDateTime gradedAt;
    private String teacherComments;
    private Boolean autoSubmitted;
}
