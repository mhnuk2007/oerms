package com.oerms.common.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckResponse {
    private String status; // UP, DOWN, DEGRADED
    private String service;
    private String version;
    private LocalDateTime timestamp;
    private Map<String, ComponentHealth> components;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentHealth {
        private String status;
        private String message;
        private Map<String, Object> details;
    }
}
