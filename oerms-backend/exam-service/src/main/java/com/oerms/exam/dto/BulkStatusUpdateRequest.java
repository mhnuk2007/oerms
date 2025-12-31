package com.oerms.exam.dto;

import com.oerms.exam.enums.ExamStatus;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkStatusUpdateRequest {
    private List<UUID> examIds;
    private ExamStatus newStatus;
}
