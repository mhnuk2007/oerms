package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PercentileDTO {
    private UUID resultId;
    private Double percentile;
    private Integer rank;
    private Integer totalStudents;
}
