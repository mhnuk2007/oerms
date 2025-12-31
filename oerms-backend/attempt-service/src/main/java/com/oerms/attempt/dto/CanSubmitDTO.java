package com.oerms.attempt.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanSubmitDTO {
    private Boolean canSubmit;
    private List<String> reasons;
}
