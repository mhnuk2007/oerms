package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiResultComparisonDTO {
    private List<ResultComparison> results;
    private Double averagePercentage;
    private Integer totalExams;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultComparison {
        private UUID resultId;
        private String examTitle;
        private Double obtainedMarks;
        private Integer totalMarks;
        private Double percentage;
        private String grade;
        private LocalDateTime submittedAt;
    }
}
