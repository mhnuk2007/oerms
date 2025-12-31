package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradingSuggestionsDTO {
    private UUID resultId;
    private List<QuestionGradingSuggestion> suggestions;
    private Double suggestedTotalMarks;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionGradingSuggestion {
        private UUID questionId;
        private String questionText;
        private String studentAnswer;
        private Double suggestedMarks;
        private Integer maxMarks;
        private String reasoning;
        private Double confidence;
    }
}
