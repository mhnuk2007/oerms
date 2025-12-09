package com.oerms.common.event;

import lombok.*;

/**
 * Event published when result is published
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ResultPublishedEvent extends BaseEvent {

    private Long resultId;
    private Long attemptId;
    private Long studentId;
    private Long examId;
    private Double obtainedMarks;
    private Double totalMarks;
    private Double percentage;
    private Boolean passed;

    public ResultPublishedEvent(Long resultId, Long attemptId, Long studentId, Long examId,
                                Double obtainedMarks, Double totalMarks, Double percentage, 
                                Boolean passed) {
        super("RESULT_PUBLISHED", "result-service");
        this.resultId = resultId;
        this.attemptId = attemptId;
        this.studentId = studentId;
        this.examId = examId;
        this.obtainedMarks = obtainedMarks;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.passed = passed;
    }
}