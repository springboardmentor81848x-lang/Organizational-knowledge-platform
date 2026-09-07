package com.okip.service.profile;

import com.okip.dto.profile.EmployeeProfileRequestDTO;
import com.okip.dto.profile.EmployeeProfileResponseDTO;

public interface ProfileService {

    EmployeeProfileResponseDTO createProfile(
            EmployeeProfileRequestDTO request);

    EmployeeProfileResponseDTO getMyProfile();

    EmployeeProfileResponseDTO updateProfile(
            EmployeeProfileRequestDTO request);

}