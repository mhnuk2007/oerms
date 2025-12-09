package com.oerms.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSummaryDTO {
    private UUID examId;
    private Long totalQuestions;
    private Integer totalMarks;
    private QuestionStatisticsDTO statistics;
}