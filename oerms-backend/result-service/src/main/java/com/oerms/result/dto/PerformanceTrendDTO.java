package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceTrendDTO {
    private UUID studentId;
    private String studentName;
    private Integer totalExams;
    private Double overallAveragePercentage;
    private Double overallAverageScore;
    private String trend; // IMPROVING, DECLINING, STABLE
    private List<TrendDataPoint> dataPoints;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private UUID examId;
        private String examTitle;
        private Double obtainedMarks;
        private Integer totalMarks;
        private Double percentage;
        private String grade;
        private Boolean passed;
        private LocalDateTime submittedAt;
    }
}
