package com.oerms.registry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer

public class SystemRegistryApplication {

    public static void main(String[] args) {
        SpringApplication.run(SystemRegistryApplication.class, args);
    }

}
