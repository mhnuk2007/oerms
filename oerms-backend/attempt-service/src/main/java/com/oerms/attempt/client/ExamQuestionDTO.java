package com.oerms.attempt.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamQuestionDTO {
    private UUID questionId;
    private Integer marks;
    private Integer negativeMarks;
    private Integer orderIndex;
}
