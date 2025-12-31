package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DifficultyValidationDTO {
    private UUID examId;
    private List<QuestionDifficultyValidation> validations;
    private Integer accurateCount;
    private Integer inaccurateCount;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDifficultyValidation {
        private UUID questionId;
        private String assignedDifficulty;
        private String actualDifficulty;
        private Double accuracyRate;
        private Boolean isAccurate;
    }
}
