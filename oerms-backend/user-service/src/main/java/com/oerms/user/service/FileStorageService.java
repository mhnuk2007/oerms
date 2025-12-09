package com.oerms.user.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final MinioClient minioClient;
    @Value("${app.minio.enabled:false}")
    private boolean minioEnabled;

    @Value("${app.minio.bucket-name}")
    private String bucketName;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Value("${app.file.max-size}")
    private long maxFileSize;

    @Value("${app.file.allowed-extensions}")
    private String[] allowedExtensions;

    @Value("${app.file.base-url}")
    private String baseUrl;

    public FileStorageService(@Autowired(required = false) MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public String storeFile(MultipartFile file, UUID userId) throws IOException {
        validateFile(file);

        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        String newFilename = userId + "_" + System.currentTimeMillis() + "." + extension;

        if (minioEnabled && minioClient != null) {
            return storeInMinio(file, newFilename);
        } else {
            return storeLocally(file, newFilename);
        }
    }

    private String storeInMinio(MultipartFile file, String filename) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String fileUrl = baseUrl + "/files/" + filename;
            log.info("File stored in MinIO: {}", fileUrl);
            return fileUrl;
        } catch (Exception e) {
            log.error("Error storing file in MinIO: {}", e.getMessage(), e);
            throw new IOException("Failed to store file in MinIO", e);
        }
    }

    private String storeLocally(MultipartFile file, String filename) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        String fileUrl = baseUrl + "/files/" + filename;
        log.info("File stored locally: {}", fileUrl);
        return fileUrl;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

        if (minioEnabled && minioClient != null) {
            deleteFromMinio(filename);
        } else {
            deleteLocally(filename);
        }
    }

    private void deleteFromMinio(String filename) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .build()
            );
            log.info("File deleted from MinIO: {}", filename);
        } catch (Exception e) {
            log.error("Error deleting file from MinIO: {}", e.getMessage(), e);
        }
    }

    private void deleteLocally(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Files.deleteIfExists(filePath);
            log.info("File deleted locally: {}", filename);
        } catch (IOException e) {
            log.error("Error deleting local file: {}", e.getMessage(), e);
        }
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IOException("File is empty");
        if (file.getSize() > maxFileSize) throw new IOException("File exceeds max size: " + maxFileSize);

        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        boolean valid = false;
        for (String allowed : allowedExtensions) {
            if (allowed.equalsIgnoreCase(extension)) {
                valid = true;
                break;
            }
        }

        if (!valid) {
            throw new IOException("File type not allowed. Allowed: " + String.join(", ", allowedExtensions));
        }
    }
}