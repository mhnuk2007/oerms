package com.oerms.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private UUID id;
    private UUID examId;
    private String questionText;
    private String questionType;
    private List<String> options;
    private String correctAnswer;
    private Integer marks;
}