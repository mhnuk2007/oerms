package com.oerms.exam.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrerequisiteCheckDTO {
    private Boolean allPrerequisitesMet;
    private List<PrerequisiteStatus> prerequisites;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrerequisiteStatus {
        private UUID examId;
        private String examTitle;
        private Boolean completed;
    }
}
