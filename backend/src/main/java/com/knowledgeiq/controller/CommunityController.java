package com.knowledgeiq.controller;

import com.knowledgeiq.model.CommunityPost;
import com.knowledgeiq.model.User;
import com.knowledgeiq.repository.CommunityPostRepository;
import com.knowledgeiq.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    @Autowired
    private CommunityPostRepository communityPostRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/guilds")
    public ResponseEntity<List<Map<String, Object>>> getGuilds() {
        List<String> defaultGuilds = List.of(
                "Java Guild",
                "DevOps Guild",
                "UI/UX Practice",
                "Cloud Architecture",
                "AI/ML Guild",
                "Product & Agile"
        );

        List<CommunityPost> allPosts = communityPostRepository.findAllByOrderByCreatedAtDesc();
        Map<String, Long> postCounts = allPosts.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(CommunityPost::getCategory, Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (String guild : defaultGuilds) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", guild);
            map.put("postsCount", postCounts.getOrDefault(guild, 0L));
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getPosts(@RequestParam(required = false) String category) {
        List<CommunityPost> posts;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            posts = communityPostRepository.findByCategoryIgnoreCaseOrderByCreatedAtDesc(category);
        } else {
            posts = communityPostRepository.findAllByOrderByCreatedAtDesc();
        }

        List<Map<String, Object>> result = posts.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId() != null ? p.getId().toString() : "");
            map.put("category", p.getCategory() != null ? p.getCategory() : "General Practice");
            map.put("title", p.getTitle());
            map.put("content", p.getContent());
            map.put("resourceUrl", p.getResourceUrl());
            map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : ZonedDateTime.now().toString());

            if (p.getAuthor() != null) {
                map.put("authorId", p.getAuthor().getId() != null ? p.getAuthor().getId().toString() : "");
                map.put("authorName", p.getAuthor().getFullName() != null ? p.getAuthor().getFullName() : "KnowledgeIQ Contributor");
                map.put("authorRole", p.getAuthor().getRole() != null ? p.getAuthor().getRole().getTitle() : "Software Engineer");
                map.put("authorAvatar", p.getAuthor().getAvatarUrl() != null ? p.getAuthor().getAvatarUrl() : "");
            } else {
                map.put("authorName", "KnowledgeIQ Contributor");
                map.put("authorRole", "Specialist");
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> payload, Authentication auth) {
        String userIdStr = (String) auth.getPrincipal();
        User author = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);

        String category = payload.getOrDefault("category", "Java Guild");
        String title = payload.get("title");
        String content = payload.get("content");
        String resourceUrl = payload.get("resourceUrl");

        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Post title is required."));
        }

        CommunityPost post = new CommunityPost(category, title, content, resourceUrl, author);
        communityPostRepository.save(post);

        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId().toString());
        map.put("title", post.getTitle());
        map.put("category", post.getCategory());
        map.put("message", "Post created successfully in " + category);
        return ResponseEntity.ok(map);
    }
}
