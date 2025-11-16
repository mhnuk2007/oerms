package com.oerms.exam.scheduler;

import com.oerms.exam.entity.Exam;
import com.oerms.exam.entity.ExamStatus;
import com.oerms.exam.event.ExamEvent;
import com.oerms.exam.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamScheduler {

    private final ExamRepository examRepository;
    private final KafkaTemplate<String, ExamEvent> kafkaTemplate;
    
    private static final String EXAM_EVENTS_TOPIC = "exam-events";

    /**
     * Auto-complete expired exams
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void autoCompleteExpiredExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> expiredExams = examRepository.findExpiredExams(now);
        
        for (Exam exam : expiredExams) {
            exam.setStatus(ExamStatus.COMPLETED);
            examRepository.save(exam);
            
            // Publish exam completed event
            publishEvent("exam.completed", exam);
            
            log.info("Auto-completed expired exam: {}", exam.getId());
        }
        
        if (!expiredExams.isEmpty()) {
            log.info("Auto-completed {} expired exams", expiredExams.size());
        }
    }

    private void publishEvent(String eventType, Exam exam) {
        ExamEvent event = ExamEvent.builder()
            .eventType(eventType)
            .examId(exam.getId())
            .teacherId(exam.getTeacherId())
            .title(exam.getTitle())
            .description(exam.getDescription())
            .duration(exam.getDuration())
            .totalMarks(exam.getTotalMarks())
            .passingMarks(exam.getPassingMarks())
            .startTime(exam.getStartTime())
            .endTime(exam.getEndTime())
            .status(exam.getStatus().name())
            .timestamp(LocalDateTime.now())
            .build();
        
        kafkaTemplate.send(EXAM_EVENTS_TOPIC, String.valueOf(exam.getId()), event);
    }
}