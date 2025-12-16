package com.oerms.result.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultEvent {
    private UUID resultId;
    private UUID examId;
    private UUID studentId;
    private Double obtainedMarks;
    private Double percentage;
    private String grade;
    private Boolean passed;
    private long timestamp;
}
