package com.oerms.result.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublishResultRequest {
    private String comments;
    private Boolean calculateRankings;
}
