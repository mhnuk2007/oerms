package com.oerms.exam.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkOperationRequest {
    private List<UUID> examIds;
}
