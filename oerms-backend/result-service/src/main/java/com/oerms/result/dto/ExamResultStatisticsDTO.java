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
    private Long withheldResults;

    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;
    private Double medianScore;

    private Double averagePercentage;
    private Double passRate; // Renamed from passPercentage for consistency

    private Long passedCount; // Added
    private Long failedCount; // Added

    private Map<String, Long> gradeDistribution; // Changed from individual grades
    private Long suspiciousResultsCount; // Added

    private Double averageTimeSpent; // minutes
}
