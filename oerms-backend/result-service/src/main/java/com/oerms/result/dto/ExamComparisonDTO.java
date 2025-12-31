package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamComparisonDTO {
    private UUID primaryExamId;
    private String primaryExamTitle;
    private List<ComparedExam> comparedExams;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparedExam {
        private UUID examId;
        private String examTitle;
        private Double averageScore;
        private Double passRate;
        private Integer totalParticipants;
    }
}
