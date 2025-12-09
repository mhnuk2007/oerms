package com.oerms.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamCancelledEvent {
    private UUID examId;
    private String reason;
    private LocalDateTime cancelledAt;
}
