package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryReportDTO {
    private UUID examId;
    private String examTitle;
    private Integer totalParticipants;
    private Double averageScore;
    private Double passRate;
    private String highestScorer;
    private Double highestScore;
    private Map<String, Long> gradeDistribution;
    private LocalDateTime generatedAt;
}
