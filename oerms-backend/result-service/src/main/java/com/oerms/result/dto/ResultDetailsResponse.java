package com.oerms.result.dto;

import com.oerms.result.enums.ResultStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultDetailsResponse {
    private UUID resultId;
    private UUID examId;
    private String examTitle;
    private UUID studentId;
    private String studentName;
    private Integer totalMarks;
    private Double obtainedMarks;
    private Double percentage;
    private String grade;
    private Boolean passed;
    private ResultStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime publishedAt;
    private Long timeTakenSeconds;
    private List<ResultQuestionDetailDTO> questions;
}
