package com.oerms.auth.mapper;

import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "userName", target = "userName")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "enabled", target = "enabled")
    @Mapping(source = "accountNonExpired", target = "accountNonExpired")
    @Mapping(source = "accountNonLocked", target = "accountNonLocked")
    @Mapping(source = "credentialsNonExpired", target = "credentialsNonExpired")
    @Mapping(source = "roles", target = "roles")
    @Mapping(source = "lastLogin", target = "lastLogin")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "updatedAt", target = "updatedAt")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
    @Mapping(source = "version", target = "version")
    UserResponse toUserResponse(User user);
}
