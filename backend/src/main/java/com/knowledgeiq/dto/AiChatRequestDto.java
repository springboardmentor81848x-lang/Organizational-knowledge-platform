package com.knowledgeiq.dto;

public class AiChatRequestDto {
    private String message;
    private String courseContext;

    public AiChatRequestDto() {}

    public AiChatRequestDto(String message, String courseContext) {
        this.message = message;
        this.courseContext = courseContext;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCourseContext() { return courseContext; }
    public void setCourseContext(String courseContext) { this.courseContext = courseContext; }
}
