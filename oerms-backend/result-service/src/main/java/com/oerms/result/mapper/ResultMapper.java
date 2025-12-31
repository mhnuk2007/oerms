package com.oerms.result.mapper;

import com.oerms.result.dto.ResultDTO;
import com.oerms.result.dto.ResultSummaryDTO;
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
    ResultDTO toDTO(Result entity);

    ResultSummaryDTO toSummaryDTO(Result entity);

    // ========================
    //  DTO → Entity
    // ========================
    @Mapping(target = "publishedBy", ignore = true)
    @Mapping(target = "teacherComments", ignore = true)
    @Mapping(target = "attemptNumber", ignore = true)
    @Mapping(target = "autoSubmitted", ignore = true)
    Result toEntity(ResultDTO dto);

    // ========================
    //  Update existing entity
    // ========================
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "publishedBy", ignore = true)
    @Mapping(target = "teacherComments", ignore = true)
    @Mapping(target = "attemptNumber", ignore = true)
    @Mapping(target = "autoSubmitted", ignore = true)
    void updateEntityFromDto(ResultDTO dto, @MappingTarget Result entity);
}
