package com.oerms.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamStatisticsDTO {
    private UUID examId;
    private String examTitle;
    private Long totalQuestions;
    private Integer totalMarks;
    private Long mcqCount;
    private Long trueFalseCount;
    private Long shortAnswerCount;
    private Long essayCount;
    private Long easyCount;
    private Long mediumCount;
    private Long hardCount;
    private String status;
}