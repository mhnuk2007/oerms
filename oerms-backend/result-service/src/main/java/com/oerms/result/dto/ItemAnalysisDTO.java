package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemAnalysisDTO {
    private UUID examId;
    private List<ItemAnalysis> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemAnalysis {
        private UUID questionId;
        private Double difficultyIndex; // P-value
        private Double discriminationIndex; // D-value
        private Double pointBiserialCorrelation;
        private String interpretation;
    }
}
