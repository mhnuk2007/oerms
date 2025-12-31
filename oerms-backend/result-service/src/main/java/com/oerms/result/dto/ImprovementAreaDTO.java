package com.oerms.result.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImprovementAreaDTO {
    private String area;
    private Double currentPerformance;
    private Double targetPerformance;
    private String priority; // HIGH, MEDIUM, LOW
    private List<String> recommendations;
}
