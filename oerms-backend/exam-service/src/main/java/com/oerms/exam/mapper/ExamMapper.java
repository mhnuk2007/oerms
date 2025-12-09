package com.oerms.exam.mapper;

import com.oerms.common.dto.CreateExamRequest;
import com.oerms.common.dto.ExamDTO;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.dto.UpdateExamRequest;
import com.oerms.exam.entity.Exam;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ExamMapper {

    /**
     * Maps Exam entity to ExamDTO
     */
    ExamDTO toDTO(Exam exam);

    /**
     * Maps list of Exam entities to list of ExamDTOs
     */
    List<ExamDTO> toDTOList(List<Exam> exams);

    /**
     * Maps CreateExamRequest to Exam entity
     * Custom mappings for teacherId and teacherName will be set in service
     */
    @Mapping(target = "teacherId", ignore = true)
    @Mapping(target = "teacherName", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "isActive", constant = "true")
    Exam toEntity(CreateExamRequest request);

    /**
     * Updates existing Exam entity from UpdateExamRequest
     * Only updates non-null fields
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "teacherId", ignore = true)
    @Mapping(target = "teacherName", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntityFromDTO(UpdateExamRequest updateRequest, @MappingTarget Exam exam);

    /**
     * Maps Spring Data Page to PageResponse
     */
    default PageResponse<ExamDTO> toPageResponse(Page<Exam> page) {
        return PageResponse.<ExamDTO>builder()
                .content(toDTOList(page.getContent()))
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
