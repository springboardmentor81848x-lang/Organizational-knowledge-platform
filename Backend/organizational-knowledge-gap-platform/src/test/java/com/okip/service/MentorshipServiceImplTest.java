package com.okip.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.okip.dto.mentorship.MentorProfileDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;
import com.okip.dto.mentorship.MentorshipStatusUpdateDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.EmployeeProfile;
import com.okip.exception.BadRequestException;
import com.okip.repository.*;
import com.okip.service.mentorship.impl.MentorshipServiceImpl;
import com.okip.service.notification.NotificationService;

public class MentorshipServiceImplTest {

    @Mock private MentorshipRequestRepository mentorshipRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private EmployeeSkillRepository employeeSkillRepository;
    @Mock private EmployeeProfileRepository employeeProfileRepository;
    @Mock private EmployeeJobRoleRepository employeeJobRoleRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private KnowledgeGapRepository knowledgeGapRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private MentorshipServiceImpl mentorshipService;

    private Employee loggedInUser;
    private Employee mentorOptedIn;
    private Employee mentorOptedOut;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        loggedInUser = new Employee();
        loggedInUser.setEmployeeId(1L);
        loggedInUser.setOfficialEmail("user@example.com");
        loggedInUser.setFirstName("User");
        loggedInUser.setLastName("One");

        mentorOptedIn = new Employee();
        mentorOptedIn.setEmployeeId(2L);
        mentorOptedIn.setOfficialEmail("mentor.in@example.com");
        mentorOptedIn.setFirstName("Mentor");
        mentorOptedIn.setLastName("OptIn");

        mentorOptedOut = new Employee();
        mentorOptedOut.setEmployeeId(3L);
        mentorOptedOut.setOfficialEmail("mentor.out@example.com");
        mentorOptedOut.setFirstName("Mentor");
        mentorOptedOut.setLastName("OptOut");

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("user@example.com");
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        when(employeeRepository.findByOfficialEmail("user@example.com")).thenReturn(Optional.of(loggedInUser));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(mentorOptedIn));
        when(employeeRepository.findById(3L)).thenReturn(Optional.of(mentorOptedOut));

        EmployeeProfile profileOptIn = new EmployeeProfile();
        profileOptIn.setEmployee(mentorOptedIn);
        profileOptIn.setAvailableAsMentor(true);

        EmployeeProfile profileOptOut = new EmployeeProfile();
        profileOptOut.setEmployee(mentorOptedOut);
        profileOptOut.setAvailableAsMentor(false);

        when(employeeProfileRepository.findByEmployee(mentorOptedIn)).thenReturn(Optional.of(profileOptIn));
        when(employeeProfileRepository.findByEmployee(mentorOptedOut)).thenReturn(Optional.of(profileOptOut));
    }

    @Test
    public void testGetAllMentors_FiltersOptedOutMentors() {
        when(employeeRepository.findAll()).thenReturn(Arrays.asList(loggedInUser, mentorOptedIn, mentorOptedOut));

        List<MentorProfileDTO> mentors = mentorshipService.getAllMentors(null, null, null);

        assertNotNull(mentors);
        assertEquals(1, mentors.size());
        assertEquals(2L, mentors.get(0).getEmployeeId());
    }

    @Test
    public void testSendRequest_FailsWhenMentorOptedOut() {
        MentorshipRequestDTO dto = new MentorshipRequestDTO();
        dto.setMentorId(3L);
        dto.setMessage("Help me");

        assertThrows(BadRequestException.class, () -> {
            mentorshipService.sendRequest(dto);
        });
    }

    @Test
    public void testUpdateRequestStatus_UnauthorizedUserThrowsBadRequestException() {
        com.okip.entity.transaction.MentorshipRequest req = new com.okip.entity.transaction.MentorshipRequest();
        req.setRequestId(50L);
        req.setMentee(mentorOptedIn); // Mentee is mentorOptedIn (ID 2)
        req.setMentor(mentorOptedOut); // Mentor is mentorOptedOut (ID 3)
        // Logged-in user is user@example.com (ID 1) who is neither mentor nor mentee

        when(mentorshipRepository.findById(50L)).thenReturn(Optional.of(req));

        MentorshipStatusUpdateDTO updateDTO = new MentorshipStatusUpdateDTO();
        updateDTO.setStatus("ACCEPTED");
        updateDTO.setNotes("Sure");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            mentorshipService.updateRequestStatus(50L, updateDTO);
        });
        assertTrue(ex.getMessage().contains("Only the designated mentor can respond to or update this mentorship request"));
    }

    @Test
    public void testUpdateRequestStatus_MenteeSelfApprovalThrowsBadRequestException() {
        com.okip.entity.transaction.MentorshipRequest req = new com.okip.entity.transaction.MentorshipRequest();
        req.setRequestId(51L);
        req.setMentee(loggedInUser); // Mentee is loggedInUser (ID 1)
        req.setMentor(mentorOptedIn); // Mentor is mentorOptedIn (ID 2)

        when(mentorshipRepository.findById(51L)).thenReturn(Optional.of(req));

        MentorshipStatusUpdateDTO updateDTO = new MentorshipStatusUpdateDTO();
        updateDTO.setStatus("ACCEPTED");
        updateDTO.setNotes("Self approve");

        // Logged-in user is mentee trying to approve/reject their own request
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            mentorshipService.updateRequestStatus(51L, updateDTO);
        });
        assertTrue(ex.getMessage().contains("Only the designated mentor can respond to or update this mentorship request"));
    }
}
