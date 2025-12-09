package com.oerms.user.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileStatsResponse {
    
    private Long total;
    private Long active;
    private Long completed;
    private Long incomplete;
}