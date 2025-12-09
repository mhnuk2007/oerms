package com.oerms.question.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class BulkCreateQuestionsRequest {

    @NotEmpty(message = "Questions list cannot be empty")
    @Valid
    private List<CreateQuestionRequest> questions;
}