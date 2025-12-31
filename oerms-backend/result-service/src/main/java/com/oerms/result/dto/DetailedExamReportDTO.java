package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailedExamReportDTO {
    private UUID examId;
    private String examTitle;
    private LocalDateTime examDate;
    private Integer totalParticipants;
    private ExamResultStatisticsDTO statistics;
    private ScoreDistributionDTO scoreDistribution;
    private List<QuestionPerformanceDTO> questionPerformances;
    private List<ResultSummaryDTO> topScorers;
    private List<ResultSummaryDTO> needsAttention;
    private Map<String, Object> additionalMetrics;
    private LocalDateTime generatedAt;
}
