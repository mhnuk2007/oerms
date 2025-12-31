package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeAnalysisDTO {
    private UUID examId;
    private Double averageTimeSeconds;
    private Long minimumTimeSeconds;
    private Long maximumTimeSeconds;
    private Double medianTimeSeconds;
}
