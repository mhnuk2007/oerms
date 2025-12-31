package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonDTO {
    private UUID resultId;
    private Double studentPercentage;
    private Double classAverage;
    private Double differenceFromAverage;
    private String performanceLevel; // ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE
}
