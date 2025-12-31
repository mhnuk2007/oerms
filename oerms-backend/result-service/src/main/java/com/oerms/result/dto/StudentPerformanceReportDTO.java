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
public class StudentPerformanceReportDTO {
    private UUID studentId;
    private String studentName;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Integer totalExams;
    private Double overallAveragePercentage;
    private Integer passedExams;
    private Integer failedExams;
    private String overallTrend;
    private Map<String, SubjectPerformanceDTO> subjectPerformances;
    private List<ResultSummaryDTO> recentResults;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;
}
