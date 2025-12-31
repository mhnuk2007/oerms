package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctoringSummaryDTO {
    private UUID attemptId;
    private Integer totalTabSwitches;
    private Integer totalWebcamViolations;
    private Integer totalViolations;
    private Boolean isSuspicious;
}
