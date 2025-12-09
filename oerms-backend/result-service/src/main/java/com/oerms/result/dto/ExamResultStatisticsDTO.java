package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultStatisticsDTO {
    private UUID examId;
    private String examTitle;
    private Long totalResults;
    private Long publishedResults;
    private Long pendingGrading;
    private Long withheldResults;

    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;
    private Double medianScore;

    private Double averagePercentage;
    private Double passPercentage;

    private Long totalPassed;
    private Long totalFailed;

    private Long gradeAPlus;
    private Long gradeA;
    private Long gradeB;
    private Long gradeC;
    private Long gradeD;
    private Long gradeF;

    private Double averageTimeSpent; // minutes
}
