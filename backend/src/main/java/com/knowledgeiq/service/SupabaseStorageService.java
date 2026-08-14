package com.knowledgeiq.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url:https://utdvsjyzybvwhudovgyn.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket:knowledgeiq-certificates}")
    private String supabaseBucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadFile(String userId, String originalName, byte[] content, String contentType) {
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalName.substring(dotIndex);
        }
        
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String path = "certificates/" + userId + "/" + uniqueFileName;

        if (supabaseKey == null || supabaseKey.trim().isEmpty()) {
            // Local Fallback Storage
            return saveLocally(uniqueFileName, content);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);
            headers.setContentType(MediaType.valueOf(contentType != null ? contentType : "application/octet-stream"));
            
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(content, headers);
            String url = supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + path;
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return path; // Return the Supabase storage path
            } else {
                System.err.println("Supabase upload returned non-2xx: " + response.getBody());
                return saveLocally(uniqueFileName, content);
            }
        } catch (Exception e) {
            System.err.println("Supabase upload failed: " + e.getMessage());
            e.printStackTrace();
            return saveLocally(uniqueFileName, content);
        }
    }

    public String getSignedUrl(String storagePath) {
        if (storagePath == null) return null;

        if (storagePath.startsWith("local:")) {
            String filename = storagePath.substring("local:".length());
            // Return local endpoint served by EmployeeController
            return "http://localhost:8086/api/uploads/certificates/" + filename;
        }

        if (supabaseKey == null || supabaseKey.trim().isEmpty()) {
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> body = new HashMap<>();
            body.put("expiresIn", 900); // 15 minutes signed URL expiry

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = supabaseUrl + "/storage/v1/object/sign/" + supabaseBucket + "/" + storagePath;
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Extract signedURL using a simple regex to avoid complex mapping
                Pattern pattern = Pattern.compile("\"signedURL\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
                Matcher matcher = pattern.matcher(response.getBody());
                if (matcher.find()) {
                    String rawUrl = matcher.group(1);
                    // Resolve relative URLs returned by Supabase
                    if (rawUrl.startsWith("/")) {
                        return supabaseUrl + rawUrl;
                    }
                    return rawUrl;
                }
                
                // Fallback for signedUrl camelCase spelling
                Pattern patternCamel = Pattern.compile("\"signedUrl\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
                Matcher matcherCamel = patternCamel.matcher(response.getBody());
                if (matcherCamel.find()) {
                    String rawUrl = matcherCamel.group(1);
                    if (rawUrl.startsWith("/")) {
                        return supabaseUrl + rawUrl;
                    }
                    return rawUrl;
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to generate signed URL from Supabase: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    private String saveLocally(String uniqueFileName, byte[] content) {
        try {
            Path uploadDir = Paths.get("uploads/certificates");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Path filePath = uploadDir.resolve(uniqueFileName);
            Files.write(filePath, content);
            System.out.println("Saved file locally at: " + filePath.toAbsolutePath());
            return "local:" + uniqueFileName;
        } catch (Exception e) {
            System.err.println("Local file fallback failed: " + e.getMessage());
            throw new RuntimeException("Failed to save certification file", e);
        }
    }
    
    public byte[] getLocalFileContent(String filename) {
        try {
            Path filePath = Paths.get("uploads/certificates").resolve(filename);
            if (Files.exists(filePath)) {
                return Files.readAllBytes(filePath);
            }
        } catch (Exception e) {
            System.err.println("Error reading local file: " + e.getMessage());
        }
        return null;
    }
}
