package com.oerms.result.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatisticsDTO {
    private UUID studentId;
    private Long totalResults;
    private Long publishedResults;
    private Double averageScore;
    private List<ResultSummaryDTO> recentResults;
}
