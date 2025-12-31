package com.oerms.attempt.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeBreakdownDTO {
    private UUID attemptId;
    private Long totalTimeSeconds;
    private List<QuestionTimeDTO> questionTimeBreakdown;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionTimeDTO {
        private UUID questionId;
        private Integer questionOrder;
        private Long timeSpentSeconds;
    }
}
