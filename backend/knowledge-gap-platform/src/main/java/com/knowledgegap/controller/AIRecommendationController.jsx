package com.knowledgegap.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AIRecommendationController {

    @GetMapping("/hello")
    public String hello() {
        System.out.println("HELLO ENDPOINT HIT");
        return "Hello AI";
    }
}