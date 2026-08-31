package com.knowledgegap.service;

import com.knowledgegap.dto.ActiveChatDTO;
import com.knowledgegap.dto.MessageDTO;
import com.knowledgegap.dto.SendMessageRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Mentorship;
import com.knowledgegap.entity.Message;
import com.knowledgegap.repository.MentorshipRepository;
import com.knowledgegap.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final MentorshipRepository mentorshipRepository;
    private final EmployeeService employeeService;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository,
                          MentorshipRepository mentorshipRepository,
                          EmployeeService employeeService,
                          NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.mentorshipRepository = mentorshipRepository;
        this.employeeService = employeeService;
        this.notificationService = notificationService;
    }

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    public MessageDTO sendMessage(SendMessageRequest request) {
        if (request == null) {
            throw new RuntimeException("Message request cannot be null.");
        }

        if (request.getMentorshipId() == null) {
            throw new RuntimeException("Peer mentorship ID is required.");
        }

        if (request.getSenderEmployeeId() == null || request.getSenderEmployeeId().trim().isEmpty()) {
            throw new RuntimeException("Sender employee ID is required.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message text cannot be empty.");
        }

        // 1. Find Mentorship
        Mentorship mentorship = mentorshipRepository.findById(request.getMentorshipId())
                .orElseThrow(() -> new RuntimeException("Peer mentorship not found with ID: " + request.getMentorshipId()));

        // 2. Validate Accepted Status
        String status = mentorship.getStatus() != null ? mentorship.getStatus().trim().toUpperCase() : "";
        if (!"ACCEPTED".equals(status) && !"ACTIVE".equals(status)) {
            throw new RuntimeException("Messaging is only enabled for accepted peer mentorship requests. Current status: " + status);
        }

        // 3. Find Sender
        Employee sender = employeeService.getEmployeeByIdentifier(request.getSenderEmployeeId())
                .orElseThrow(() -> new RuntimeException("Sender employee not found: " + request.getSenderEmployeeId()));

        // 4. Validate Sender is a participant and determine Receiver
        Employee mentee = mentorship.getMentee();
        Employee mentor = mentorship.getMentor();

        Employee receiver;
        if (sender.getId().equals(mentee.getId())) {
            receiver = mentor;
        } else if (sender.getId().equals(mentor.getId())) {
            receiver = mentee;
        } else {
            throw new RuntimeException("You are not an authorized participant in this peer mentorship.");
        }

        // 5. Create and save Message
        Message message = new Message();
        message.setPeerMentorship(mentorship);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessage(request.getMessage().trim());
        message.setSentAt(LocalDateTime.now());
        message.setReadStatus(false);

        Message savedMessage = messageRepository.save(message);

        // 6. Notify Receiver
        try {
            String senderName = getFullName(sender);
            String skillName = mentorship.getSkill() != null ? mentorship.getSkill().getSkillName() : "Mentorship";
            notificationService.createNotification(
                    receiver,
                    "PEER_MESSAGE",
                    "New message from " + senderName + " in " + skillName + " peer mentorship."
            );
        } catch (Exception ignored) {
            // Logging or non-fatal notification failure
        }

        return toDTO(savedMessage);
    }

    // =========================================================
    // GET MESSAGES FOR A PEER MENTORSHIP
    // =========================================================

    public List<MessageDTO> getMessages(Long mentorshipId, String employeeIdentifier) {
        if (mentorshipId == null) {
            throw new RuntimeException("Mentorship ID is required.");
        }

        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Peer mentorship not found with ID: " + mentorshipId));

        String status = mentorship.getStatus() != null ? mentorship.getStatus().trim().toUpperCase() : "";
        if (!"ACCEPTED".equals(status) && !"ACTIVE".equals(status)) {
            throw new RuntimeException("Messaging is only enabled for accepted peer mentorship requests.");
        }

        Employee currentEmployee = null;
        if (employeeIdentifier != null && !employeeIdentifier.trim().isEmpty()) {
            currentEmployee = employeeService.getEmployeeByIdentifier(employeeIdentifier).orElse(null);
        }

        // Mark unread messages addressed to the current employee as read
        if (currentEmployee != null) {
            List<Message> unreadMessages = messageRepository.findUnreadMessages(mentorshipId, currentEmployee);
            if (!unreadMessages.isEmpty()) {
                for (Message unread : unreadMessages) {
                    unread.setReadStatus(true);
                }
                messageRepository.saveAll(unreadMessages);
            }
        }

        List<Message> messages = messageRepository.findByPeerMentorshipIdOrderBySentAtAsc(mentorshipId);
        List<MessageDTO> dtoList = new ArrayList<>();
        for (Message m : messages) {
            dtoList.add(toDTO(m));
        }

        return dtoList;
    }

    // =========================================================
    // GET ACTIVE CHATS FOR AN EMPLOYEE
    // =========================================================

    public List<ActiveChatDTO> getActiveChats(String employeeIdentifier) {
        Employee employee = employeeService.getEmployeeByIdentifier(employeeIdentifier)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeIdentifier));

        List<Mentorship> activeMentorships = mentorshipRepository.findActivePeerMentorships(employee);
        List<ActiveChatDTO> chats = new ArrayList<>();

        for (Mentorship mentorship : activeMentorships) {
            boolean isCurrentUserMentor = employee.getId().equals(mentorship.getMentor().getId());
            Employee peer = isCurrentUserMentor ? mentorship.getMentee() : mentorship.getMentor();

            Optional<Message> latestMessageOpt = messageRepository.findTopByPeerMentorshipIdOrderBySentAtDesc(mentorship.getId());
            long unreadCount = messageRepository.countByPeerMentorshipIdAndReceiverAndReadStatusFalse(mentorship.getId(), employee);

            ActiveChatDTO dto = new ActiveChatDTO();
            dto.setMentorshipId(mentorship.getId());
            dto.setPeerId(peer.getId());
            dto.setPeerEmployeeId(peer.getEmployeeId());
            dto.setPeerName(getFullName(peer));
            dto.setPeerDesignation(peer.getDesignation() != null ? peer.getDesignation() : "");
            dto.setPeerDepartment(peer.getDepartment() != null ? peer.getDepartment().getDepartmentName() : "");
            dto.setSkillId(mentorship.getSkill() != null ? mentorship.getSkill().getId() : null);
            dto.setSkillName(mentorship.getSkill() != null ? mentorship.getSkill().getSkillName() : "General Mentoring");
            dto.setStatus(mentorship.getStatus());
            dto.setCurrentUserMentor(isCurrentUserMentor);

            if (latestMessageOpt.isPresent()) {
                Message last = latestMessageOpt.get();
                dto.setLastMessage(last.getMessage());
                dto.setLastMessageTime(last.getSentAt());
            } else {
                dto.setLastMessage("Peer mentorship accepted. Start your conversation!");
                dto.setLastMessageTime(null);
            }

            dto.setUnreadCount(unreadCount);
            chats.add(dto);
        }

        // Sort chats by latest message time desc (or by mentorshipId if no messages yet)
        chats.sort((a, b) -> {
            if (a.getLastMessageTime() != null && b.getLastMessageTime() != null) {
                return b.getLastMessageTime().compareTo(a.getLastMessageTime());
            } else if (a.getLastMessageTime() != null) {
                return -1;
            } else if (b.getLastMessageTime() != null) {
                return 1;
            } else {
                return b.getMentorshipId().compareTo(a.getMentorshipId());
            }
        });

        return chats;
    }

    // =========================================================
    // HELPER MAPPING
    // =========================================================

    private MessageDTO toDTO(Message m) {
        String senderName = getFullName(m.getSender());
        String receiverName = getFullName(m.getReceiver());
        String skillName = "";
        if (m.getPeerMentorship() != null && m.getPeerMentorship().getSkill() != null) {
            skillName = m.getPeerMentorship().getSkill().getSkillName();
        }

        return new MessageDTO(
                m.getId(),
                m.getPeerMentorship() != null ? m.getPeerMentorship().getId() : null,
                m.getSender() != null ? m.getSender().getId() : null,
                m.getSender() != null ? m.getSender().getEmployeeId() : null,
                senderName,
                m.getReceiver() != null ? m.getReceiver().getId() : null,
                m.getReceiver() != null ? m.getReceiver().getEmployeeId() : null,
                receiverName,
                m.getMessage(),
                m.getSentAt(),
                m.getReadStatus(),
                skillName
        );
    }

    private String getFullName(Employee emp) {
        if (emp == null) return "Unknown";
        String first = emp.getFirstName() != null ? emp.getFirstName().trim() : "";
        String last = emp.getLastName() != null ? emp.getLastName().trim() : "";
        String full = (first + " " + last).trim();
        return full.isEmpty() ? emp.getEmployeeId() : full;
    }
}
