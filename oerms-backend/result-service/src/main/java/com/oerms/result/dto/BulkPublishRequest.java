package com.oerms.result.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPublishRequest {
    private List<UUID> resultIds;
    private String comments;
    private Boolean calculateRankings;
}
