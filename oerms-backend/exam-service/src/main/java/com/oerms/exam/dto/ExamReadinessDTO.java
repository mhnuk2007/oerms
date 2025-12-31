package com.oerms.exam.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamReadinessDTO {
    private UUID examId;
    private Boolean isReady;
    private List<String> issues;
    private List<String> warnings;
    private Boolean canPublish;
}
