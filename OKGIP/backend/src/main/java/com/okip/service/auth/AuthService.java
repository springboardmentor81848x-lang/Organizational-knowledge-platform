package com.okip.service.auth;

import com.okip.dto.auth.LoginRequestDTO;
import com.okip.dto.auth.LoginResponseDTO;
import com.okip.dto.auth.RegisterRequestDTO;
import com.okip.dto.auth.RegisterResponseDTO;

public interface AuthService {

    RegisterResponseDTO registerEmployee(RegisterRequestDTO request);
    
    LoginResponseDTO loginEmployee(LoginRequestDTO request);

}