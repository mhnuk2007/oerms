package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectAnalyticsDTO {
    private String subject;
    private Integer totalExams;
    private Integer totalStudents;
    private Double overallAverageScore;
    private Double overallPassRate;
    private List<ExamPerformance> examPerformances;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamPerformance {
        private UUID examId;
        private String examTitle;
        private Double averageScore;
        private Double passRate;
        private LocalDateTime conductedAt;
    }
}
