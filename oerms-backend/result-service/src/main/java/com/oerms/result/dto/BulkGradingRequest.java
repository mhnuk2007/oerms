package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradingRequest {
    private List<GradeEntry> grades;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeEntry {
        private UUID resultId;
        private Double obtainedMarks;
        private String comments;
    }
}
