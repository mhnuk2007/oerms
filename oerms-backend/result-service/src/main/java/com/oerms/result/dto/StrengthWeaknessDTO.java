package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StrengthWeaknessDTO {
    private UUID resultId;
    private List<TopicPerformance> strengths;
    private List<TopicPerformance> weaknesses;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicPerformance {
        private String topic;
        private Integer questionsAttempted;
        private Integer correctAnswers;
        private Double accuracy;
    }
}
