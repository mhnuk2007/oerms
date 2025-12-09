package com.oerms.result.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublishResultRequest {
    @NotNull(message = "Result ID is required")
    private UUID resultId;

    private String teacherRemarks;
}
