package com.oerms.exam.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateExamRequest {
    private String newTitle;
    private Boolean copyQuestions;
}
