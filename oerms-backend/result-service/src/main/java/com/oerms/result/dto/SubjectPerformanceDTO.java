package com.oerms.result.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectPerformanceDTO {
    private String subject;
    private Integer totalExams;
    private Double averagePercentage;
    private Integer passedExams;
    private Integer failedExams;
    private String trend;
}
