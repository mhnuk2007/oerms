package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScheduleRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
