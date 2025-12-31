package com.oerms.result.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendAnalysisDTO {
    private String overallTrend; // IMPROVING, DECLINING, STABLE
    private Double trendStrength; // 0.0 to 1.0
    private List<TrendMetric> metrics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendMetric {
        private String metric;
        private String trend;
        private Double changePercentage;
    }
}
