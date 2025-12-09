package com.oerms.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultDTO {
    private UUID id;
    private UUID attemptId;
    private UUID userId;
    private UUID examId;
    private Integer obtainedMarks;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
}