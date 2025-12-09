package com.oerms.user.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.minio.enabled", havingValue = "true")
@Slf4j
public class MinioConfig {

    @Value("${app.minio.url}")
    private String minioUrl;

    @Value("${app.minio.access-key}")
    private String accessKey;

    @Value("${app.minio.secret-key}")
    private String secretKey;

    @Value("${app.minio.bucket-name}")
    private String bucketName;

    @Value("${app.minio.public-read:false}")
    private boolean publicRead;

    @Bean
    public MinioClient minioClient() {
        try {
            MinioClient client = MinioClient.builder()
                    .endpoint(minioUrl)
                    .credentials(accessKey, secretKey)
                    .build();

            // Create bucket if it doesn't exist
            boolean bucketExists = client.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );

            if (!bucketExists) {
                client.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );
                log.info("MinIO bucket created: {}", bucketName);
                // Set bucket policy for public read if enabled
                if (publicRead) {
                    setBucketPublicReadPolicy(client);
                }
            } else {
                log.info("MinIO bucket already exists: {}", bucketName);
            }

            // Test connection
            client.listBuckets();
            log.info("MinIO client initialized successfully");
            return client;
        } catch (Exception e) {
            log.error("Error initializing MinIO client: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize MinIO client", e);
        }
    }

    private void setBucketPublicReadPolicy(MinioClient client) {
        try {
            String policy = """
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::%s/*"]
                        }
                    ]
                }
                """.formatted(bucketName);

            client.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucketName)
                            .config(policy)
                            .build()
            );

            log.info("Bucket policy set for public read access: {}", bucketName);
        } catch (Exception e) {
            log.warn("Failed to set bucket policy: {}", e.getMessage());
        }
    }
}
