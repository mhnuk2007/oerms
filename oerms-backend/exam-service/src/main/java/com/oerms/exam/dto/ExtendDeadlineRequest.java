package com.oerms.exam.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtendDeadlineRequest {
    private Integer extensionMinutes;
    private String reason;
}
