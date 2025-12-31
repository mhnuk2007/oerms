package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationStatusDTO {
    private UUID examId;
    private String examTitle;
    private Long totalResults;
    private Long publishedResults;
    private Long unpublishedResults;
    private Long draftResults;
    private Long pendingGradingResults;
    private Long gradedResults;
    private Long withheldResults;
    private Double publicationRate;
}
