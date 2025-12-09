package com.oerms.common.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard pagination request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageRequest {

    @Min(value = 0, message = "Page number must be >= 0")
    @Builder.Default
    private int page = 0;

    @Min(value = 1, message = "Page size must be >= 1")
    @Max(value = 100, message = "Page size must be <= 100")
    @Builder.Default
    private int size = 10;

    @Builder.Default
    private String sortBy = "id";

    @Builder.Default
    private String sortDir = "asc";

    public org.springframework.data.domain.PageRequest toSpringPageRequest() {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("desc") ?
                org.springframework.data.domain.Sort.by(sortBy).descending() :
                org.springframework.data.domain.Sort.by(sortBy).ascending();

        return org.springframework.data.domain.PageRequest.of(page, size, sort);
    }
}