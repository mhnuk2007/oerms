package com.oerms.result.dto;

import lombok.*;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreDistributionDTO {
    private UUID examId;
    private Map<Integer, Long> scoreRanges; // Range (0-10, 10-20, etc.) -> Count
    private Double median;
    private Double standardDeviation;
}
