package com.oerms.attempt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.oerms.attempt", "com.oerms.common.config", "com.oerms.common.exception"})
@EnableDiscoveryClient
@EnableFeignClients
@EnableJpaAuditing
public class AttemptServiceApplication {
public static void main(String[] args) {
SpringApplication.run(AttemptServiceApplication.class, args);
}
}