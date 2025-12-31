package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEfficiencyDTO {
    private UUID resultId;
    private Long totalTimeSeconds;
    private Double averageTimePerQuestion;
    private String efficiencyRating; // FAST, OPTIMAL, SLOW, VERY_SLOW
}
