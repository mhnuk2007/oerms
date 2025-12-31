package com.oerms.attempt.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViolationDetailDTO {
    private String type; // TAB_SWITCH, WEBCAM_VIOLATION, COPY_PASTE, etc.
    private String severity; // LOW, MEDIUM, HIGH
    private String description;
    private LocalDateTime timestamp;
}
