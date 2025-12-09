package com.oerms.result.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithholdResultRequest {
    @NotNull(message = "Result ID is required")
    private UUID resultId;

    @NotNull(message = "Reason is required")
    private String reason;
}
