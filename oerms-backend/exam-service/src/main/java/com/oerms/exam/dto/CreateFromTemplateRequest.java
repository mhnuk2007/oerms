package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFromTemplateRequest {
    private String title;
    private Integer duration;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
