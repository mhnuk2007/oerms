package com.oerms.user.mapper;

import com.oerms.common.dto.UserProfileDTO;
import com.oerms.common.event.*;
import com.oerms.user.dto.*;
import com.oerms.user.entity.UserProfile;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserProfileMapper {

    // ========================= ENTITY → DTO =========================
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "profilePictureUrl", target = "profilePictureUrl")
    UserProfileDTO toDTO(UserProfile profile);

    ProfileSummaryResponse toSummaryResponse(UserProfile profile);

    // ========================= REQUEST → ENTITY =========================
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "profilePictureUrl", ignore = true)
    @Mapping(target = "profileCompleted", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    UserProfile toEntity(CreateProfileRequest request);

    // ========================= UPDATE ENTITY =========================
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "profilePictureUrl", ignore = true)
    @Mapping(target = "profileCompleted", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntityFromRequest(UpdateProfileRequest request, @MappingTarget UserProfile profile);

    // ========================= ENTITY → EVENTS =========================
    @Mapping(target = "profileId", source = "id")
    @Mapping(target = "userId", ignore = true)  // set in service
    @Mapping(target = "email", source = "email")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "profileCompleted", source = "profileCompleted")
    UserProfileCreatedEvent toCreatedEvent(UserProfile profile);

    @Mapping(target = "profileId", source = "id")
    @Mapping(target = "userId", ignore = true) // set in service
    @Mapping(target = "email", source = "email")
    @Mapping(target = "updatedAt", source = "updatedAt")
    @Mapping(target = "profileCompleted", source = "profileCompleted")
    UserProfileUpdatedEvent toUpdatedEvent(UserProfile profile);

    // ========================= LIST MAPPINGS =========================
    List<ProfileSummaryResponse> toSummaryList(List<UserProfile> list);
}