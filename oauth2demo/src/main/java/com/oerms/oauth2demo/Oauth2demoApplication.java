package com.oerms.oauth2demo;

import com.oerms.oauth2demo.config.RsaKeyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({RsaKeyProperties.class})
public class Oauth2demoApplication {

    public static void main(String[] args) {
        SpringApplication.run(Oauth2demoApplication.class, args);
    }

}
