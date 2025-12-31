package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatisticsDTO {
    private UUID studentId;
    private String studentName;
    private Long totalResults;
    private Long publishedResults;
    private Double averageScore;
    private Double averagePercentage;
    private Long passedExams;
    private Long failedExams;
    private List<ResultSummaryDTO> recentResults;
}
