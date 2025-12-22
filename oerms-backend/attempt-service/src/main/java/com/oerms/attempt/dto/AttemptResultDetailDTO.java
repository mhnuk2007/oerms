package com.oerms.attempt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultDetailDTO {
    private UUID questionId;
    private String questionText;
    private String questionType;
    private List<String> options;
    private String correctAnswer;
    private Set<String> studentSelectedOptions;
    private String studentAnswerText;
    private Boolean isCorrect;
    private Integer marksAllocated;
    private Double marksObtained;
}
