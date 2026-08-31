package com.knowledgegap.dto;

import java.time.LocalDateTime;

public class ActiveChatDTO {

    private Long mentorshipId;
    private Long peerId;
    private String peerEmployeeId;
    private String peerName;
    private String peerDesignation;
    private String peerDepartment;
    private Long skillId;
    private String skillName;
    private String status;
    private boolean isCurrentUserMentor;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;

    public ActiveChatDTO() {
    }

    public ActiveChatDTO(Long mentorshipId, Long peerId, String peerEmployeeId, String peerName,
                         String peerDesignation, String peerDepartment, Long skillId, String skillName,
                         String status, boolean isCurrentUserMentor, String lastMessage,
                         LocalDateTime lastMessageTime, long unreadCount) {
        this.mentorshipId = mentorshipId;
        this.peerId = peerId;
        this.peerEmployeeId = peerEmployeeId;
        this.peerName = peerName;
        this.peerDesignation = peerDesignation;
        this.peerDepartment = peerDepartment;
        this.skillId = skillId;
        this.skillName = skillName;
        this.status = status;
        this.isCurrentUserMentor = isCurrentUserMentor;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
    }

    public Long getMentorshipId() {
        return mentorshipId;
    }

    public void setMentorshipId(Long mentorshipId) {
        this.mentorshipId = mentorshipId;
    }

    public Long getPeerId() {
        return peerId;
    }

    public void setPeerId(Long peerId) {
        this.peerId = peerId;
    }

    public String getPeerEmployeeId() {
        return peerEmployeeId;
    }

    public void setPeerEmployeeId(String peerEmployeeId) {
        this.peerEmployeeId = peerEmployeeId;
    }

    public String getPeerName() {
        return peerName;
    }

    public void setPeerName(String peerName) {
        this.peerName = peerName;
    }

    public String getPeerDesignation() {
        return peerDesignation;
    }

    public void setPeerDesignation(String peerDesignation) {
        this.peerDesignation = peerDesignation;
    }

    public String getPeerDepartment() {
        return peerDepartment;
    }

    public void setPeerDepartment(String peerDepartment) {
        this.peerDepartment = peerDepartment;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isCurrentUserMentor() {
        return isCurrentUserMentor;
    }

    public void setCurrentUserMentor(boolean currentUserMentor) {
        isCurrentUserMentor = currentUserMentor;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }
}
