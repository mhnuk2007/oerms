package com.oerms.notification.dto;

import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailRequest {
    private String to;
    private String[] cc;
    private String[] bcc;
    private String subject;
    private String body;
    private String templateCode;
    private Map<String, Object> templateData;
    private Boolean isHtml;
}