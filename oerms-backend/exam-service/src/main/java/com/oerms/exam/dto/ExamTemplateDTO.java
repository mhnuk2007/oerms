package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamTemplateDTO {
    private UUID id;
    private String templateName;
    private String description;
    private String subject;
    private Integer duration;
    private Integer totalMarks;
    private UUID createdBy;
    private LocalDateTime createdAt;
}
