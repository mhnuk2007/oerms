package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkOperationResultDTO {
    private Integer totalRequested;
    private Integer successful;
    private Integer failed;
    private List<UUID> successfulIds;
    private Map<UUID, String> failedItems;
}
