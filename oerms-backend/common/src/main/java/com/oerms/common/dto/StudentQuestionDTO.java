package com.oerms.common.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuestionDTO {
    private UUID id;
    private String questionText;
    private String type;
    private List<String> options;
    private Integer marks;
    private String difficulty;
    private String topic;
    private Integer questionOrder;
}
