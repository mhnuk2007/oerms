package com.oerms.result.dto;

import com.oerms.result.enums.ResultStatus;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultSearchCriteria {
    private String studentName;
    private UUID examId;
    private ResultStatus status;
    private Boolean passed;
    private Double minPercentage;
    private Double maxPercentage;
}
