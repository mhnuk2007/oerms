package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAttemptRequest {
    private UUID attemptId;
    private String notes;
}
