package com.oerms.exam.dto;

import com.oerms.common.dto.ExamDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamWithQuestionsDTO {
    private ExamDTO exam;
    private List<QuestionResponse> questions;
    private Long questionCount;
    private Integer totalMarks;
    private QuestionStatisticsDTO statistics;
}
