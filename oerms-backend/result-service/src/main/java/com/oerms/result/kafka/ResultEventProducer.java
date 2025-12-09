package com.oerms.result.kafka;

import com.oerms.result.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResultEventProducer {

    private final KafkaTemplate<String, ResultEvent> kafkaTemplate;

    public void publishResultPublished(Result result) {
        ResultEvent event = ResultEvent.builder()
            .resultId(result.getId())
            .examId(result.getExamId())
            .studentId(result.getStudentId())
            .obtainedMarks(result.getObtainedMarks())
            .percentage(result.getPercentage())
            .grade(result.getGrade())
            .passed(result.getPassed())
            .timestamp(System.currentTimeMillis())
            .build();
        
        kafkaTemplate.send("result-published-topic", event);
    }
}