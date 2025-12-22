package com.oerms.exam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {
    "com.oerms.exam",
    "com.oerms.common.exception"
})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.oerms.exam.client")
@EnableScheduling
public class ExamServiceApplication {
public static void main(String[] args) {
SpringApplication.run(ExamServiceApplication.class, args);
}
}