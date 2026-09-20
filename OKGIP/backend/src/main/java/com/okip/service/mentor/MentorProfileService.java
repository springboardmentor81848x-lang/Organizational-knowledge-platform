package com.okip.service.mentor;

import com.okip.entity.master.MentorProfile;

public interface MentorProfileService {

    MentorProfile assignMentor(Long employeeId);

    MentorProfile unassignMentor(Long employeeId);

    MentorProfile getMentorProfile(Long employeeId);

    boolean isActiveMentor(Long employeeId);
}