package com.oerms.result.dto;

import lombok.*;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAnalyticsDTO {
    private UUID examId;
    private ExamResultStatisticsDTO statistics;
    private Map<String, Long> performanceBands;
    private Integer totalParticipants;
}
