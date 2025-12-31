package com.oerms.attempt.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlagSuspiciousRequest {
    private String reason;
    private String flaggedBy;
}
