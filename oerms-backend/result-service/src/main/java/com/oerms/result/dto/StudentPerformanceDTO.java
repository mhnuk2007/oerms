package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPerformanceDTO {
    private UUID studentId;
    private String studentName;
    private Long totalExams;
    private Long completedExams;
    private Double averageScore;
    private Double averagePercentage;
    private Long totalPassed;
    private Long totalFailed;
    private String mostCommonGrade;
    private Double improvementTrend;
}
