package com.oerms.attempt.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanStartAttemptDTO {
    private Boolean canStart;
    private List<String> reasons;
}
