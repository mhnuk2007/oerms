package com.oerms.attempt.kafka;

import com.oerms.attempt.entity.AttemptAnswer;
import com.oerms.attempt.entity.ExamAttempt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttemptEventProducer {

    private final KafkaTemplate<String, AttemptEvent> kafkaTemplate;

    private static final String ATTEMPT_STARTED_TOPIC = "attempt-started-topic";
    private static final String ATTEMPT_SUBMITTED_TOPIC = "attempt-submitted-topic";
    private static final String ATTEMPT_AUTO_SUBMITTED_TOPIC = "attempt-auto-submitted-topic";
    private static final String ANSWER_SAVED_TOPIC = "answer-saved-topic";

    public void publishAttemptStarted(ExamAttempt attempt) {
        AttemptEvent event = AttemptEvent.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .status(attempt.getStatus().name())
                .timestamp(System.currentTimeMillis())
                .additionalInfo(Map.of(
                        "attemptNumber", attempt.getAttemptNumber(),
                        "totalQuestions", attempt.getTotalQuestions()
                ))
                .build();

        kafkaTemplate.send(ATTEMPT_STARTED_TOPIC, event);
        log.info("Published attempt started event for attemptId: {}", attempt.getId());
    }

    public void publishAnswerSaved(ExamAttempt attempt, AttemptAnswer answer) {
        Map<String, Object> info = new HashMap<>();
        info.put("questionId", answer.getQuestionId());
        info.put("selectedOptions", answer.getSelectedOptions());
        info.put("answerText", answer.getAnswerText());
        info.put("flagged", answer.getFlagged());
        info.put("marksAllocated", answer.getMarksAllocated());
        info.put("marksObtained", answer.getMarksObtained());

        AttemptEvent event = AttemptEvent.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .studentId(attempt.getStudentId())
                .status(attempt.getStatus().name())
                .timestamp(System.currentTimeMillis())
                .additionalInfo(info)
                .build();

        kafkaTemplate.send(ANSWER_SAVED_TOPIC, event);
        log.debug("Published answer saved event for attemptId: {}, questionId: {}", attempt.getId(), answer.getQuestionId());
    }

    public void publishAttemptSubmitted(ExamAttempt attempt) {
        AttemptEvent event = AttemptEvent.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .studentId(attempt.getStudentId())
                .status(attempt.getStatus().name())
                .timestamp(System.currentTimeMillis())
                .additionalInfo(Map.of(
                        "obtainedMarks", attempt.getObtainedMarks(),
                        "percentage", attempt.getPercentage()
                ))
                .build();

        kafkaTemplate.send(ATTEMPT_SUBMITTED_TOPIC, event);
        log.info("Published attempt submitted event for attemptId: {}", attempt.getId());
    }

    public void publishAttemptAutoSubmitted(ExamAttempt attempt) {
        AttemptEvent event = AttemptEvent.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .studentId(attempt.getStudentId())
                .status(attempt.getStatus().name())
                .timestamp(System.currentTimeMillis())
                .additionalInfo(Map.of(
                        "obtainedMarks", attempt.getObtainedMarks(),
                        "percentage", attempt.getPercentage(),
                        "autoSubmitted", true
                ))
                .build();

        kafkaTemplate.send(ATTEMPT_AUTO_SUBMITTED_TOPIC, event);
        log.info("Published attempt auto-submitted event for attemptId: {}", attempt.getId());
    }
}
