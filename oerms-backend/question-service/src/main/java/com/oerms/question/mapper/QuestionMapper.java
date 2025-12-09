package com.oerms.question.mapper;

import com.oerms.question.dto.QuestionDTO;
import com.oerms.question.dto.StudentQuestionDTO;
import com.oerms.question.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface QuestionMapper {
    QuestionMapper INSTANCE = Mappers.getMapper(QuestionMapper.class);

    QuestionDTO toQuestionDTO(Question question);

    StudentQuestionDTO toStudentQuestionDTO(Question question);
}
