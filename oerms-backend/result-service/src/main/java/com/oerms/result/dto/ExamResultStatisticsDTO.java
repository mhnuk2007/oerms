package com.oerms.result.dto;

import lombok.*;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultStatisticsDTO {
    private UUID examId;
    private String examTitle;
    private Long totalResults;
    private Long publishedResults;
    private Long pendingGrading;
    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;
    private Double averagePercentage;
    private Long passedCount;
    private Long failedCount;
    private Double passRate;
    private Map<String, Long> gradeDistribution;
    private Long suspiciousResultsCount;
}
