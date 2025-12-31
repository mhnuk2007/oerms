package com.oerms.result.dto;

import lombok.*;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMatrixDTO {
    private UUID examId;
    private Map<String, TopicPerformance> topicPerformances;
    private Map<String, DifficultyPerformance> difficultyPerformances;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicPerformance {
        private String topic;
        private Integer questionCount;
        private Double averageAccuracy;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyPerformance {
        private String difficulty;
        private Integer questionCount;
        private Double averageAccuracy;
    }
}
