package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultQuestionDetailDTO {
    private UUID questionId;
    private String questionText;
    private String questionType;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private Set<String> studentSelectedOptions;
    private String studentAnswerText;
    private Boolean isCorrect;
    private Integer marksAllocated;
    private Double marksObtained;
}
