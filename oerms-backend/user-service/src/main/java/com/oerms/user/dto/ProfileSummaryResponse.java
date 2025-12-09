package com.oerms.user.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileSummaryResponse {

    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String city;
    private String institution;
    private boolean profileCompleted;
}