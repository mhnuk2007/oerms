package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private UUID id;
    private String questionText;
    private String type;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private Integer marks;
    private String difficulty;
    private String topic;
}
