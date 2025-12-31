package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipationMetricsDTO {
    private UUID examId;
    private Integer enrolledStudents;
    private Integer participatedStudents;
    private Double participationRate;
    private Integer completedResults;
    private Integer pendingGrading;
}
