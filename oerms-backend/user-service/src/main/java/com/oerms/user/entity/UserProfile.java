package com.oerms.user.entity;

import com.oerms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_profiles", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId; // From auth-server

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "institution", length = 200)
    private String institution; // Single institution per user

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "profile_completed")
    @Builder.Default
    private Boolean profileCompleted = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Helper method to check if profile is complete
    public void checkProfileCompletion() {
        this.profileCompleted = firstName != null && !firstName.isBlank() &&
                lastName != null && !lastName.isBlank() &&
                city != null && !city.isBlank() &&
                institution != null && !institution.isBlank();
    }
}
