package com.okip.service.mentorship;

import java.util.List;
import com.okip.dto.mentorship.MentorProfileDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;
import com.okip.dto.mentorship.MentorshipResponseDTO;
import com.okip.dto.mentorship.MentorshipStatusUpdateDTO;

public interface MentorshipService {
    List<MentorProfileDTO> getAllMentors(Long skillId, String department, String search);
    List<MentorProfileDTO> getRecommendedMentorsForMyGaps();
    MentorProfileDTO getMentorProfile(Long employeeId);
    MentorshipResponseDTO sendRequest(MentorshipRequestDTO request);
    List<MentorshipResponseDTO> getMySentRequests();
    List<MentorshipResponseDTO> getMyReceivedRequests();
    List<MentorshipResponseDTO> getActiveMentorships();
    MentorshipResponseDTO updateRequestStatus(Long requestId, MentorshipStatusUpdateDTO statusUpdate);
}
