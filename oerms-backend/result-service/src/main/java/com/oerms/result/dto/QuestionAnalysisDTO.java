package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnalysisDTO {
    private UUID questionId;
    private String questionText;
    private Boolean isCorrect;
    private Double marksObtained;
    private Integer marksAllocated;
    private String studentAnswer;
    private String correctAnswer;
    private String explanation;
}
