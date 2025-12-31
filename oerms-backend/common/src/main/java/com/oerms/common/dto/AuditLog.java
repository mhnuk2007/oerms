package com.oerms.common.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    private UUID id;
    private String action;
    private String entityType;
    private UUID entityId;
    private UUID performedBy;
    private String performedByName;
    private LocalDateTime performedAt;
    private Map<String, Object> changes;
    private String ipAddress;
}
