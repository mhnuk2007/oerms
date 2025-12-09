package com.oerms.result.mapper;

import com.oerms.result.dto.ResultDTO;
import com.oerms.result.entity.Result;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ResultMapper {

    // ========================
    //  Entity → DTO
    // ========================
    ResultDTO toDto(Result entity);

    // ========================
    //  DTO → Entity
    // ========================
    Result toEntity(ResultDTO dto);

    // ========================
    //  Update existing entity
    // ========================
    void updateEntityFromDto(ResultDTO dto, @MappingTarget Result entity);
}
