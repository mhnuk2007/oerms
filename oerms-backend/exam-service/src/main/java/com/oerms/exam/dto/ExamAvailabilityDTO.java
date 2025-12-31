package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAvailabilityDTO {
    private UUID examId;
    private Boolean isAvailable;
    private List<String> reasons;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration;
}
