package com.oerms.result.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeResultRequest {
    private Double obtainedMarks;
    private String comments;
}
