package com.okip.service.admin;

import com.okip.dto.admin.CreateUserRequestDTO;
import com.okip.dto.admin.CreateUserResponseDTO;

public interface AdminService {

    CreateUserResponseDTO createUser(CreateUserRequestDTO request);

}