package com.oerms.exam.mapper;


import com.oerms.common.dto.PageResponse;
import com.oerms.exam.dto.CreateExamRequest;
import com.oerms.exam.dto.ExamDTO;
import com.oerms.exam.dto.UpdateExamRequest;
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

    ExamDTO toDTO(Exam exam);

    List<ExamDTO> toDTOList(List<Exam> exams);

    @Mapping(target = "teacherId", ignore = true)
    @Mapping(target = "teacherName", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "isActive", constant = "true")
    Exam toEntity(CreateExamRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "teacherId", ignore = true)
    @Mapping(target = "teacherName", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntityFromDTO(UpdateExamRequest updateRequest, @MappingTarget Exam exam);

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
