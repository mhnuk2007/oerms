package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamConflictDTO {
    private UUID examId;
    private String examTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String conflictType; // TIME_OVERLAP, RESOURCE_CONFLICT, etc.
}
