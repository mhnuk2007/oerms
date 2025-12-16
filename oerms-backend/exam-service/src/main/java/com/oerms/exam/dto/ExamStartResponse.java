package com.oerms.exam.dto;

import com.oerms.common.dto.AttemptResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExamStartResponse {
    private ExamDTO exam;
    private AttemptResponse attempt;
}