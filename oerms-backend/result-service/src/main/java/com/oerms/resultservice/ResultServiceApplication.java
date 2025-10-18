package com.oerms.resultservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Main entry point for the Result Service.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ResultServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResultServiceApplication.class, args);
    }
}