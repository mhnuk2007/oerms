package com.oerms.result.dto;

import com.oerms.result.enums.ResultStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultSummaryDTO {
    private UUID id;
    private UUID examId;
    private String examTitle;
    private Double obtainedMarks;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
    private Boolean passed;
    private ResultStatus status;
    private LocalDateTime publishedAt;
}
