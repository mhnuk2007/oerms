package com.oerms.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionRequest {

    @NotBlank(message = "Institution name is required")
    @Size(max = 200)
    private String institution;
}
