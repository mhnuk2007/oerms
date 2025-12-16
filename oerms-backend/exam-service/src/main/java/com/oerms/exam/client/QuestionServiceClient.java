package com.oerms.exam.client;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(
    name = "question-service",
    path = "/api/questions"
)
public interface QuestionServiceClient {
    // This client is now split into TeacherQuestionServiceClient and potentially a student client.
    // The methods have been moved to TeacherQuestionServiceClient.
    // This interface is kept for now to avoid breaking existing injections.
}
