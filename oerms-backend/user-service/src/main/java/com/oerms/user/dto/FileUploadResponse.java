package com.oerms.user.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {
    
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String contentType;
    private LocalDateTime uploadedAt;
}
