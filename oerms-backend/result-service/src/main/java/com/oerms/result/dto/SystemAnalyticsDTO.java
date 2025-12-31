package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAnalyticsDTO {
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Long totalExams;
    private Long totalResults;
    private Long totalStudents;
    private Double systemAverageScore;
    private Double systemPassRate;
    private Map<String, SubjectStats> subjectStatistics;
    private List<TrendPoint> performanceTrend;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectStats {
        private String subject;
        private Long examCount;
        private Double averageScore;
        private Double passRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendPoint {
        private LocalDateTime date;
        private Double averageScore;
        private Double passRate;
    }
}
