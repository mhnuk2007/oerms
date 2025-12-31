package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressTrackingDTO {
    private UUID studentId;
    private String subject;
    private LocalDateTime sinceDate;
    private Integer totalExams;
    private Double averagePercentage;
    private String trend; // IMPROVING, DECLINING, STABLE
    private List<ProgressPoint> progressPoints;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressPoint {
        private String examTitle;
        private Double percentage;
        private LocalDateTime date;
        private Boolean passed;
    }
}
