package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultInsightsDTO {
    private UUID resultId;
    private String performanceLevel; // EXCELLENT, GOOD, AVERAGE, BELOW_AVERAGE, NEEDS_IMPROVEMENT
    private List<String> recommendations;
    private List<String> strengthAreas;
    private List<String> improvementAreas;
    private Double comparedToAverage;
}
