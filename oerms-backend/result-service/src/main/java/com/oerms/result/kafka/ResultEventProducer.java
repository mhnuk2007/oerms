package com.oerms.result.kafka;

import com.oerms.result.entity.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate; // Import KafkaTemplate
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResultEventProducer {

    private final KafkaTemplate<String, ResultEvent> kafkaTemplate;

    public void publishResultCreated(Result result) {
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
        
        kafkaTemplate.send("result-created-topic", event);
        log.info("Published ResultCreated event for resultId: {}", result.getId());
    }

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
        log.info("Published ResultPublished event for resultId: {}", result.getId());
    }

    public void publishResultGraded(Result result) {
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
        
        kafkaTemplate.send("result-graded-topic", event);
        log.info("Published ResultGraded event for resultId: {}", result.getId());
    }
}
